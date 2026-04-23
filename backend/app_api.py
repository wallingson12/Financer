from datetime import timedelta

from dotenv import load_dotenv
load_dotenv()
import os
import re
import logging
from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)

from services.conta_service import ContaService
from infrastructure.database import criar_tabelas
from repositories.repository import (
    UsuarioRepository,
    ContaRepository,
    InvestimentoRepository
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename
from flask_cors import CORS

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[],
        storage_uri="memory://"
    )

    secret_key = os.environ.get("FINANCER_SECRET_KEY")
    jwt_key = os.environ.get("FINANCER_JWT_KEY")

    if not secret_key or not jwt_key:
        raise RuntimeError("Variáveis de ambiente FINANCER_SECRET_KEY e FINANCER_JWT_KEY são obrigatórias.")

    app.config["SECRET_KEY"] = secret_key
    app.config["JWT_SECRET_KEY"] = jwt_key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

    jwt = JWTManager(app)

    @jwt.expired_token_loader
    def expired(jwt_header, jwt_payload):
        return jsonify({"erro": "Token expirado"}), 401

    @jwt.invalid_token_loader
    def invalid(error):
        return jsonify({"erro": "Token inválido"}), 401

    @jwt.unauthorized_loader
    def missing(error):
        return jsonify({"erro": "Token obrigatório"}), 401

    # ==================================
    # ERROS HTTP (404, 405, 429, etc)
    # ==================================
    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        mensagens = {
            400: "Requisição inválida",
            401: "Não autorizado",
            403: "Acesso negado",
            404: "Rota não encontrada",
            405: "Método não permitido",
            413: "Arquivo muito grande",
            429: "Muitas requisições"
        }

        return jsonify({
            "erro": mensagens.get(e.code, e.description)
        }), e.code

    # ==================================
    # ERROS INTERNOS
    # ==================================
    @app.errorhandler(Exception)
    def handle_internal_error(e):
        logging.exception(e)

        return jsonify({
            "erro": "Erro interno do servidor"
        }), 500

    usuario_repo = UsuarioRepository()
    conta_repo = ContaRepository()
    investimento_repo = InvestimentoRepository()
    conta_service = ContaService(conta_repo)

    @app.route("/api/refresh", methods=["POST"])
    @jwt_required(refresh=True)
    @limiter.limit("20 per minute")
    def refresh():
        user_id = get_jwt_identity()
        novo_token = create_access_token(identity=user_id)
        return jsonify({
            "access_token": novo_token
        })

    # ===============================
    # REGISTRO
    # ===============================
    @app.route("/api/registro", methods=["POST"])
    @limiter.limit("5 per minute")
    def registro():
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        nome = str(data.get("nome", "")).strip()
        numero = str(data.get("numero", "")).strip()
        senha = str(data.get("senha", "")).strip()

        if not nome or not numero or not senha:
            return jsonify({"erro": "Preencha todos os campos."}), 400

        if len(nome) < 3 or len(nome) > 80:
            return jsonify({"erro": "Nome inválido."}), 400

        if len(senha) < 8 or len(senha) > 72:
            return jsonify({
                "erro": "Senha deve ter entre 8 e 72 caracteres."
            }), 400

        if not re.match(r"^\d{7}-\d{1}$", numero):
            return jsonify({
                "erro": "Número inválido. Use 1234567-8"
            }), 400

        if usuario_repo.buscar_por_numero(numero):
            return jsonify({
                "erro": "Não foi possível concluir cadastro."
            }), 400

        usuario_repo.criar(nome, numero, senha)

        return jsonify({
            "mensagem": "Conta criada com sucesso!"
        }), 201

    # ===============================
    # LOGIN
    # ===============================
    @app.route("/api/login", methods=["POST"])
    @limiter.limit("5 per minute")
    def login():
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        numero = str(data.get("numero", "")).strip()
        senha = str(data.get("senha", "")).strip()

        if not numero or not senha:
            return jsonify({"erro": "Credenciais inválidas."}), 401

        if not re.match(r"^\d{7}-\d{1}$", numero):
            return jsonify({"erro": "Credenciais inválidas."}), 401

        usuario = usuario_repo.buscar_por_numero(numero)

        if usuario and usuario.checar_senha(senha):
            token = create_access_token(identity=str(usuario.id))
            token_refresh = create_refresh_token(identity=str(usuario.id))

            return jsonify({
                "access_token": token,
                "refresh_token": token_refresh,
                "nome": usuario.nome,
                "tipo": usuario.tipo
            })

        return jsonify({"erro": "Credenciais inválidas."}), 401

    # ===============================
    # UPLOAD
    # ===============================
    @app.route("/api/upload", methods=["POST"])
    @jwt_required()
    @limiter.limit("10 per minute")
    def upload():
        usuario_id = int(get_jwt_identity())
        usuario = usuario_repo.buscar_por_id(usuario_id)

        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        if "extrato" not in request.files:
            return jsonify({"erro": "Arquivo não enviado"}), 400

        arquivo = request.files["extrato"]
        arquivo.filename = secure_filename(arquivo.filename)

        if arquivo.filename == "":
            return jsonify({"erro": "Nenhum arquivo selecionado"}), 400

        extensoes_permitidas = {"csv", "xlsx", "xls"}
        extensao = arquivo.filename.rsplit(".", 1)[-1].lower()

        if extensao not in extensoes_permitidas:
            return jsonify({
                "erro": "Formato inválido. Use csv, xlsx ou xls."
            }), 400

        conta_service.processar_upload(arquivo, usuario)

        return jsonify({
            "mensagem": "Extrato importado com sucesso!"
        }), 200

    # ===============================
    # DASHBOARD
    # ===============================
    @app.route("/api/dashboard", methods=["GET"])
    @jwt_required()
    @limiter.limit("60 per minute")
    def dashboard():
        usuario_id = int(get_jwt_identity())

        saldos = conta_repo.buscar_saldos_mensais(usuario_id)

        if not saldos:
            return jsonify([])

        resultado = [
            {
                "mes": row["mes"],
                "total_credito": float(row["total_credito"]),
                "total_debito": float(row["total_debito"]),
                "saldo": float(row["saldo"]),
            }
            for row in saldos
        ]

        return jsonify(resultado)

    # ===============================
    # TRANSAÇÕES
    # ===============================
    @app.route("/api/transacoes", methods=["GET"])
    @jwt_required()
    @limiter.limit("60 per minute")
    def transacoes():
        usuario_id = int(get_jwt_identity())

        registros = conta_repo.buscar_transacoes(usuario_id)

        if not registros:
            return jsonify([])

        return jsonify(registros)

    # ===============================
    # CATEGORIZAR
    # ===============================
    @app.route("/api/categorizar", methods=["POST"])
    @jwt_required()
    @limiter.limit("30 per minute")
    def categorizar():
        usuario_id = int(get_jwt_identity())
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        transacao_id = data.get("transacao_id")
        categoria = data.get("categoria")
        aplicar_todas = data.get("aplicar_todas", False)

        categorias_validas = {
            "Receita",
            "Moradia",
            "Alimentação",
            "Transporte",
            "Saúde",
            "Lazer",
            "Educação",
            "Investimento",
            "Sem categoria"
        }

        if not transacao_id or not categoria:
            return jsonify({"erro": "Dados incompletos."}), 400

        if categoria not in categorias_validas:
            return jsonify({"erro": "Categoria inválida."}), 400

        if aplicar_todas:
            transacao = conta_repo.buscar_transacao_por_id(
                transacao_id,
                usuario_id
            )

            if not transacao:
                return jsonify({"erro": "Transação não encontrada"}), 404

            qtd = conta_repo.atualizar_categoria_em_lote(
                transacao["tipo"],
                transacao["detalhe"],
                categoria,
                usuario_id
            )

            return jsonify({
                "mensagem": f"{qtd} transação(ões) categorizadas!"
            })

        conta_repo.atualizar_categoria(
            transacao_id,
            categoria,
            usuario_id
        )

        return jsonify({"mensagem": "Transação categorizada!"})

    # ===============================
    # INVESTIMENTOS
    # ===============================
    @app.route("/api/investimentos", methods=["GET"])
    @jwt_required()
    @limiter.limit("60 per minute")
    def investimentos():
        usuario_id = int(get_jwt_identity())

        dados = investimento_repo.buscar_por_usuario(usuario_id)

        if not dados:
            return jsonify([])

        return jsonify(dados)

    # ===============================
    # SALVAR INVESTIMENTOS
    # ===============================
    @app.route("/api/investimentos/salvar", methods=["POST"])
    @jwt_required()
    @limiter.limit("20 per minute")
    def salvar_investimento():
        usuario_id = int(get_jwt_identity())
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        papel = str(data.get("papel", "")).strip()
        saldo = data.get("saldo")
        descricao = str(data.get("descricao", "Sem descrição")).strip()

        if not papel or saldo is None:
            return jsonify({
                "erro": "Preencha todos os campos obrigatórios."
            }), 400

        try:
            saldo = float(saldo)
        except (TypeError, ValueError):
            return jsonify({"erro": "Saldo inválido."}), 400

        if saldo < 0:
            return jsonify({"erro": "Saldo não pode ser negativo."}), 400

        if len(papel) > 20:
            return jsonify({"erro": "Papel inválido."}), 400

        if len(descricao) > 120:
            return jsonify({"erro": "Descrição muito longa."}), 400

        investimento_repo.salvar(
            usuario_id,
            saldo,
            papel.upper(),
            descricao
        )

        return jsonify({
            "mensagem": "Investimento salvo com sucesso!"
        })

    # ===============================
    # REMOVER INVESTIMENTO
    # ===============================
    @app.route(
        "/api/investimentos/remover/<int:investimento_id>",
        methods=["DELETE"]
    )
    @jwt_required()
    @limiter.limit("20 per minute")
    def remover_investimento(investimento_id):
        usuario_id = int(get_jwt_identity())

        if investimento_id <= 0:
            return jsonify({
                "erro": "Investimento inválido."
            }), 400

        investimento_repo.remover(
            investimento_id,
            usuario_id
        )

        return jsonify({
            "mensagem": "Investimento removido."
        })

    return app


if __name__ == "__main__":
    app = create_app()
    criar_tabelas()
    app.run(host="0.0.0.0", port=5000, debug=False)