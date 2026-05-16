import os
import re
import logging

from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user,
)
from services.conta_service import ContaService
from services.alerta_service import AlertaService
from services.category import CATEGORIAS_VALIDAS
from infrastructure.database import criar_tabelas
from repositories.repository import UsuarioRepository, ContaRepository, InvestimentoRepository

from dotenv import load_dotenv
from pathlib import Path
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from urllib.parse import urlparse, urljoin
from werkzeug.utils import secure_filename

load_dotenv(Path(__file__).parent.parent / ".env")

# Logger de auditoria separado
audit_log = logging.getLogger("financer.audit")


def is_safe_url(target):
    if not target:
        return False
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.netloc == ref_url.netloc

def create_app() -> Flask:
    app = Flask(__name__)

    # Rate limiter: usa Redis em produção quando REDIS_URL estiver definida
    limiter_storage = os.environ.get("REDIS_URL", "memory://")
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[],
        storage_uri=limiter_storage
    )

    secret = os.environ.get("FINANCER_SECRET_KEY")
    if not secret:
        raise RuntimeError("FINANCER_SECRET_KEY não configurada.")
    app.config["SECRET_KEY"] = secret
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

    login_manager = LoginManager(app)
    login_manager.login_view = 'login'

    usuario_repo = UsuarioRepository()
    conta_repo = ContaRepository()
    conta_service = ContaService(conta_repo)
    investimento_repo = InvestimentoRepository()
    alerta_service = AlertaService()

    @login_manager.user_loader
    def load_user(user_id):
        return usuario_repo.buscar_por_id(int(user_id))

    # ===============================
    # REGISTRO
    # ===============================
    @app.route('/registro', methods=['GET', 'POST'])
    @limiter.limit("5 per minute")  # FIX #1 — rate limit no registro
    def registro():
        if request.method == 'POST':
            nome   = str(request.form.get('nome',   '') or '').strip()
            numero = str(request.form.get('numero', '') or '').strip()
            senha  = str(request.form.get('senha',  '') or '').strip()
            tipo   = request.form.get('tipo', 'pessoal')

            # FIX #2 — validação de comprimento
            if len(nome) < 3 or len(nome) > 80:
                flash('Nome inválido.', 'erro')
                return redirect(url_for('registro'))

            if len(senha) < 8 or len(senha) > 72:
                flash('Senha deve ter entre 8 e 72 caracteres.', 'erro')
                return redirect(url_for('registro'))

            if not re.match(r'^\d{7}-\d{1}$', numero):
                flash('Número de conta inválido! Use o formato: 1234567-8', 'erro')
                return redirect(url_for('registro'))

            if usuario_repo.buscar_por_numero(numero):
                flash('Número de conta já cadastrado!', 'erro')
                return redirect(url_for('registro'))

            usuario_repo.criar(nome, numero, senha, tipo)
            audit_log.info("registro_ok numero=%s ip=%s", numero, request.remote_addr)
            flash('Conta criada com sucesso! Faça login.', 'sucesso')
            return redirect(url_for('login'))

        return render_template('registro.html')

    # ===============================
    # LOGIN
    # ===============================
    @app.route('/login', methods=['GET', 'POST'])
    @limiter.limit("5 per minute")  # FIX #1 — rate limit no login
    def login():
        if request.method == 'POST':
            numero = str(request.form.get('numero', '') or '').strip()
            senha  = str(request.form.get('senha',  '') or '').strip()
            usuario = usuario_repo.buscar_por_numero(numero)

            if usuario and usuario.checar_senha(senha):
                login_user(usuario)

                # FIX #3 — audit log: login bem-sucedido
                audit_log.info(
                    "login_ok usuario_id=%s ip=%s",
                    usuario.id, request.remote_addr
                )

                next_page = request.args.get('next')
                if next_page and is_safe_url(next_page):
                    return redirect(next_page)
                return redirect(url_for('index'))

            # FIX #3 — audit log: tentativa falha
            audit_log.warning(
                "login_falhou numero=%s ip=%s",
                numero, request.remote_addr
            )
            flash('Número ou senha incorretos!', 'erro')

        return render_template('login.html')

    # ===============================
    # LOGOUT
    # ===============================
    @app.route('/logout')
    @login_required
    def logout():
        audit_log.info("logout usuario_id=%s ip=%s", current_user.id, request.remote_addr)
        logout_user()
        return redirect(url_for('login'))

    # ===============================
    # DASHBOARD
    # ===============================
    @app.route('/')
    @login_required
    def index():
        saldos = conta_repo.buscar_saldos_mensais(current_user.id)

        alerta = None
        if current_user.tipo == 'mei':
            total_anual = conta_repo.buscar_total_anual(current_user.id)
            alerta = alerta_service.verificar_limite_mei(total_anual)

        if not saldos:
            return render_template(
                'dashboard.html',
                meses=[], creditos=[], debitos=[], saldos=[], vazio=True, alerta=alerta
            )

        meses    = [row['mes'] for row in saldos]
        creditos = [row['total_credito'] for row in saldos]
        debitos  = [row['total_debito'] for row in saldos]
        saldos_v = [row['saldo'] for row in saldos]

        return render_template(
            'dashboard.html',
            meses=meses, creditos=creditos,
            debitos=debitos, saldos=saldos_v,
            vazio=False, alerta=alerta
        )

    # ===============================
    # IMPORTAR
    # ===============================
    @app.route('/importar')
    @login_required
    def importar():
        return render_template('index.html')

    # ===============================
    # UPLOAD
    # ===============================
    @app.route('/upload', methods=['POST'])
    @login_required
    @limiter.limit("10 per minute")
    def upload():
        if 'extrato' not in request.files:
            flash('Arquivo não enviado.', 'erro')
            return redirect(url_for('importar'))

        arquivo = request.files['extrato']
        arquivo.filename = secure_filename(arquivo.filename)

        if arquivo.filename == '':
            flash('Nenhum arquivo selecionado.', 'erro')
            return redirect(url_for('importar'))

        # FIX #4 — try/except: nunca expõe stack trace ao usuário
        try:
            conta = conta_service.processar_upload(arquivo, current_user)
        except ValueError as e:
            flash(str(e), 'erro')
            return redirect(url_for('importar'))
        except Exception:
            logging.exception("Erro no upload usuario_id=%s", current_user.id)
            flash('Erro ao processar o arquivo. Verifique o formato e tente novamente.', 'erro')
            return redirect(url_for('importar'))

        meses    = [str(m) for m in conta.saldos_mensais.index]
        saldos   = [round(row['saldo'], 2)         for _, row in conta.saldos_mensais.iterrows()]
        creditos = [round(row['total_credito'], 2) for _, row in conta.saldos_mensais.iterrows()]
        debitos  = [round(row['total_debito'], 2)  for _, row in conta.saldos_mensais.iterrows()]

        return render_template(
            'dashboard.html',
            meses=meses, saldos=saldos,
            creditos=creditos, debitos=debitos,
            vazio=False, alerta=None
        )

    # ===============================
    # TRANSAÇÕES
    # ===============================
    @app.route('/transacoes')
    @login_required
    def transacoes():
        registros = conta_repo.buscar_transacoes(current_user.id)
        return render_template(
            'transacoes.html',
            registros=registros,
            categorias=sorted(CATEGORIAS_VALIDAS)
        )

    # ===============================
    # CATEGORIZAR
    # ===============================
    @app.route('/categorizar', methods=['POST'])
    @login_required
    def categorizar():
        transacao_id  = request.form.get('transacao_id')
        categoria     = str(request.form.get('categoria', '') or '').strip()
        aplicar_todas = request.form.get('aplicar_todas')
        usuario_id    = current_user.id

        # FIX #5 — validar categoria contra allowlist
        if categoria not in CATEGORIAS_VALIDAS:
            flash('Categoria inválida.', 'erro')
            return redirect(url_for('transacoes'))

        if aplicar_todas == '1':
            transacao = conta_repo.buscar_transacao_por_id(transacao_id, usuario_id)
            if transacao:
                qtd = conta_repo.atualizar_categoria_em_lote(
                    transacao['tipo'], transacao['detalhe'], categoria, usuario_id
                )
                flash(f'✅ {qtd} transação(ões) categorizadas como "{categoria}"!', 'success')
            else:
                flash('❌ Transação não encontrada.', 'error')
        else:
            conta_repo.atualizar_categoria(transacao_id, categoria, usuario_id)
            flash(f'✅ Transação categorizada como "{categoria}"!', 'success')

        return redirect(url_for('transacoes'))

    # ===============================
    # INVESTIMENTOS
    # ===============================
    @app.route('/investimentos')
    @login_required
    def investimentos():
        dados = investimento_repo.buscar_por_usuario(current_user.id)
        return render_template('investimentos.html', investimentos=dados)

    @app.route('/avisos')
    @login_required
    def orientacoes():
        if current_user.tipo != 'mei':
            return redirect(url_for('index'))
        return render_template('avisos.html')

    @app.route('/investimentos/salvar', methods=['POST'])
    @login_required
    @limiter.limit("20 per minute")
    def salvar_investimento():
        papel     = str(request.form.get('papel',    '') or '').strip()
        saldo_raw = request.form.get('saldo', '')
        descricao = str(request.form.get('descricao', 'Sem descrição') or '').strip()

        if not papel or not saldo_raw:
            flash('Preencha todos os campos obrigatórios.', 'erro')
            return redirect(url_for('investimentos'))

        # FIX #6 — conversão segura de saldo
        try:
            saldo = float(saldo_raw)
        except (TypeError, ValueError):
            flash('Saldo inválido.', 'erro')
            return redirect(url_for('investimentos'))

        if saldo < 0:
            flash('Saldo não pode ser negativo.', 'erro')
            return redirect(url_for('investimentos'))

        if len(papel) > 20:
            flash('Papel inválido.', 'erro')
            return redirect(url_for('investimentos'))

        if len(descricao) > 120:
            flash('Descrição muito longa.', 'erro')
            return redirect(url_for('investimentos'))

        investimento_repo.salvar(current_user.id, saldo, papel.upper(), descricao)
        flash('Investimento salvo com sucesso!', 'sucesso')
        return redirect(url_for('investimentos'))

    @app.route('/investimentos/remover/<int:investimento_id>', methods=['POST'])
    @login_required
    def remover_investimento(investimento_id):
        investimento_repo.remover(investimento_id, current_user.id)
        audit_log.info(
            "investimento_removido id=%s usuario_id=%s ip=%s",
            investimento_id, current_user.id, request.remote_addr
        )
        flash('Investimento removido.', 'sucesso')
        return redirect(url_for('investimentos'))

    return app


if __name__ == '__main__':
    app = create_app()
    criar_tabelas()
    app.run(debug=False)