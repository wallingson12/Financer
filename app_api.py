import os
import re

from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
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


def create_app() -> Flask:
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get(
        "FINANCER_SECRET_KEY",
        "dev-financer-secret"
    )

    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "FINANCER_JWT_KEY",
        "dev-jwt-secret"
    )

    # 🔥 Garante compatibilidade com versões novas
    app.config["JWT_IDENTITY_CLAIM"] = "sub"

    JWTManager(app)

    usuario_repo = UsuarioRepository()
    conta_repo = ContaRepository()
    investimento_repo = InvestimentoRepository()
    conta_service = ContaService(conta_repo)

    # ===============================
    # REGISTRO
    # ===============================
    @app.route("/api/registro", methods=["POST"])
    def registro():
        data = request.get_json()

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        nome = data.get("nome")
        numero = data.get("numero")
        senha = data.get("senha")

        if not nome or not numero or not senha:
            return jsonify({"erro": "Preencha todos os campos."}), 400

        if not re.match(r"^\d{7}-\d{1}$", numero):
            return jsonify({"erro": "Número inválido. Use 1234567-8"}), 400

        if usuario_repo.buscar_por_numero(numero):
            return jsonify({"erro": "Número já cadastrado."}), 400

        usuario_repo.criar(nome, numero, senha)

        return jsonify({"mensagem": "Conta criada com sucesso!"}), 201

    # ===============================
    # LOGIN
    # ===============================
    @app.route("/api/login", methods=["POST"])
    def login():
        data = request.get_json()

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        numero = data.get("numero")
        senha = data.get("senha")

        usuario = usuario_repo.buscar_por_numero(numero)

        if usuario and usuario.checar_senha(senha):
            # 🔥 Identity precisa ser string
            token = create_access_token(identity=str(usuario.id))

            return jsonify({
                "token": token,
                "nome": usuario.nome
            })

        return jsonify({"erro": "Número ou senha incorretos."}), 401

    # ===============================
    # DASHBOARD
    # ===============================
    @app.route("/api/dashboard", methods=["GET"])
    @jwt_required()
    def dashboard():
        usuario_id = int(get_jwt_identity())  # converte para int

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
    def transacoes():
        usuario_id = int(get_jwt_identity())
        registros = conta_repo.buscar_transacoes(usuario_id)
        return jsonify(registros or [])

    # ===============================
    # CATEGORIZAR
    # ===============================
    @app.route("/api/categorizar", methods=["POST"])
    @jwt_required()
    def categorizar():
        usuario_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        transacao_id = data.get("transacao_id")
        categoria = data.get("categoria")
        aplicar_todas = data.get("aplicar_todas", False)

        if not transacao_id or not categoria:
            return jsonify({"erro": "Dados incompletos."}), 400

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
    def investimentos():
        usuario_id = int(get_jwt_identity())
        dados = investimento_repo.buscar_por_usuario(usuario_id)
        return jsonify(dados or [])

    @app.route("/api/investimentos/salvar", methods=["POST"])
    @jwt_required()
    def salvar_investimento():
        usuario_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({"erro": "JSON inválido"}), 400

        papel = data.get("papel")
        saldo = data.get("saldo")
        descricao = data.get("descricao", "Sem descrição")

        if not papel or saldo is None:
            return jsonify({"erro": "Preencha todos os campos obrigatórios."}), 400

        investimento_repo.salvar(
            usuario_id,
            float(saldo),
            papel,
            descricao
        )

        return jsonify({"mensagem": "Investimento salvo com sucesso!"})

    @app.route(
        "/api/investimentos/remover/<int:investimento_id>",
        methods=["DELETE"]
    )
    @jwt_required()
    def remover_investimento(investimento_id):
        usuario_id = int(get_jwt_identity())

        investimento_repo.remover(
            investimento_id,
            usuario_id
        )

        return jsonify({"mensagem": "Investimento removido."})

    return app


if __name__ == "__main__":
    app = create_app()
    criar_tabelas()
    app.run(host="0.0.0.0", port=5000, debug=True)