import os
import re

from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user,
)

from services.conta_service import ContaService
from infrastructure.database import criar_tabelas
from repositories.repository import UsuarioRepository, ContaRepository


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("FINANCER_SECRET_KEY", "dev-financer-secret")

    login_manager = LoginManager(app)
    login_manager.login_view = 'login'

    usuario_repo = UsuarioRepository()
    conta_repo = ContaRepository()
    conta_service = ContaService(conta_repo)

    @login_manager.user_loader
    def load_user(user_id):
        return usuario_repo.buscar_por_id(int(user_id))

    @app.route('/registro', methods=['GET', 'POST'])
    def registro():
        if request.method == 'POST':
            nome = request.form.get('nome')
            numero = request.form.get('numero')
            senha = request.form.get('senha')

            if not re.match(r'^\d{7}-\d{1}$', numero):
                flash('Número de conta inválido! Use o formato: 1234567-8', 'erro')
                return redirect(url_for('registro'))

            if usuario_repo.buscar_por_numero(numero):
                flash('Número de conta já cadastrado!', 'erro')
                return redirect(url_for('registro'))

            usuario_repo.criar(nome, numero, senha)
            flash('Conta criada com sucesso! Faça login.', 'sucesso')
            return redirect(url_for('login'))

        return render_template('registro.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            numero = request.form.get('numero')
            senha = request.form.get('senha')
            usuario = usuario_repo.buscar_por_numero(numero)

            if usuario and usuario.checar_senha(senha):
                login_user(usuario)
                return redirect(url_for('index'))

            flash('Número ou senha incorretos!', 'erro')

        return render_template('login.html')

    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('login'))

    @app.route('/')
    @login_required
    def index():
        saldos = conta_repo.buscar_saldos_mensais(current_user.id)

        if not saldos:
            return render_template(
                'dashboard.html',
                meses=[], creditos=[], debitos=[], saldos=[], vazio=True
            )

        meses = [row['mes'] for row in saldos]
        creditos = [row['total_credito'] for row in saldos]
        debitos = [row['total_debito'] for row in saldos]
        saldos_v = [row['saldo'] for row in saldos]

        return render_template(
            'dashboard.html',
            meses=meses, creditos=creditos, debitos=debitos, saldos=saldos_v, vazio=False
        )

    @app.route('/importar')
    @login_required
    def importar():
        return render_template('index.html')

    @app.route('/upload', methods=['POST'])
    @login_required
    def upload():
        arquivo = request.files['extrato']
        conta = conta_service.processar_upload(arquivo, current_user)

        meses = [str(m) for m in conta.saldos_mensais.index]
        saldos = [round(row['saldo'], 2) for _, row in conta.saldos_mensais.iterrows()]
        creditos = [round(row['total_credito'], 2) for _, row in conta.saldos_mensais.iterrows()]
        debitos = [round(row['total_debito'], 2) for _, row in conta.saldos_mensais.iterrows()]

        return render_template(
            'dashboard.html',
            meses=meses, saldos=saldos, creditos=creditos, debitos=debitos, vazio=False
        )

    CATEGORIAS = [
        'Sem categoria', 'Alimentação', 'Transporte', 'Saúde',
        'Lazer', 'Educação', 'Moradia', 'Receita', 'Outros', 'Cartão', 'DAS'
    ]

    @app.route('/transacoes')
    @login_required
    def transacoes():
        registros = conta_repo.buscar_transacoes(current_user.id)
        return render_template('transacoes.html', registros=registros, categorias=CATEGORIAS)

    @app.route('/categorizar', methods=['POST'])
    @login_required
    def categorizar():
        transacao_id = request.form.get('transacao_id')
        categoria = request.form.get('categoria')
        aplicar_todas = request.form.get('aplicar_todas')
        usuario_id = current_user.id

        if aplicar_todas == '1':
            # Busca a transação para pegar tipo/detalhe
            transacao = conta_repo.buscar_transacao_por_id(transacao_id, usuario_id)

            if transacao:
                # Atualiza todas iguais
                qtd = conta_repo.atualizar_categoria_em_lote(
                    transacao['tipo'],
                    transacao['detalhe'],
                    categoria,
                    usuario_id
                )
                flash(f'✅ {qtd} transação(ões) categorizadas como "{categoria}"!', 'success')
            else:
                flash('❌ Transação não encontrada', 'error')
        else:
            # Atualiza só essa transação
            conta_repo.atualizar_categoria(transacao_id, categoria, usuario_id)
            flash(f'✅ Transação categorizada como "{categoria}"!', 'success')

        return redirect(url_for('transacoes'))

    return app


if __name__ == '__main__':
    app = create_app()
    criar_tabelas()
    app.run(debug=True)