import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Float, ForeignKey

# -------------------------------------------------------------------
# Conexão
# Em desenvolvimento: define DATABASE_URL no seu .env
# No Render: a variável é preenchida automaticamente pelo serviço PostgreSQL
# -------------------------------------------------------------------
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///financer.db")

# O Render fornece URLs com prefixo "postgres://", mas o SQLAlchemy exige "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# -------------------------------------------------------------------
# Modelos
# -------------------------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String, nullable=False)
    numero = Column(String, nullable=False)
    senha_hash = Column(String, nullable=False)
    tipo = Column(String, nullable=False, default="pessoal")


class Transacao(Base):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    data = Column(String)
    tipo = Column(String)
    detalhe = Column(String)
    credito = Column(Float)
    debito = Column(Float)
    categoria = Column(String, default="Sem categoria")


class SaldoMensal(Base):
    __tablename__ = "saldos_mensais"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    mes = Column(String)
    total_credito = Column(Float)
    total_debito = Column(Float)
    saldo = Column(Float)


class Investimento(Base):
    __tablename__ = "investimentos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, unique=True)
    saldo = Column(Float, nullable=False, default=0.0)
    descricao = Column(String, default="Sem descrição")


# -------------------------------------------------------------------
# Criação das tabelas (substitui criar_tabelas())
# -------------------------------------------------------------------
def criar_tabelas():
    Base.metadata.create_all(bind=engine)


# -------------------------------------------------------------------
# Helpers para migração gradual do código existente
# Permite continuar usando o padrão conn.execute() enquanto migra
# -------------------------------------------------------------------
def get_connection():
    """Retorna uma conexão raw para uso com execute() direto.
    Use durante a migração. Prefira get_session() no código novo."""
    return engine.connect()


def get_session():
    """Retorna uma Session do SQLAlchemy para o código novo."""
    return SessionLocal()