from flask_login import UserMixin
from werkzeug.security import check_password_hash


class Usuario(UserMixin):
    def __init__(self, id, nome, numero, senha_hash, tipo='pessoal'):
        self.id = id
        self.nome = nome
        self.numero = numero
        self.senha_hash = senha_hash
        self.tipo = tipo

    def checar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
