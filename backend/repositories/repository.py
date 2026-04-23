from infrastructure.database import get_connection
from werkzeug.security import generate_password_hash
from models.usuario import Usuario
from sqlalchemy import text
import pandas as pd
import logging
logger = logging.getLogger(__name__)

class UsuarioRepository:
    def criar(self, nome, numero, senha, tipo='pessoal'):
        try:
            with get_connection() as conn:
                conn.execute(
                    text("INSERT INTO usuarios (nome, numero, senha_hash, tipo) VALUES (:nome, :numero, :senha_hash, :tipo)"),
                    {"nome": nome, "numero": numero, "senha_hash": generate_password_hash(senha, method='bcrypt'), "tipo": tipo}
                )
                conn.commit()
        except Exception as e:
            logger.exception("Erro ao criar usuário")
            raise ValueError("Não foi possível criar o usuário")

    def buscar_por_numero(self, numero):
        try:
            with get_connection() as conn:
                row = conn.execute(
                    text("SELECT id, nome, numero, senha_hash, tipo FROM usuarios WHERE numero = :numero"),
                    {"numero": numero}
                ).fetchone()
            if row:
                return Usuario(row.id, row.nome, row.numero, row.senha_hash, row.tipo)
        except Exception as e:
            logger.error(f"Erro ao buscar por número: {e}")
        return None

    def buscar_por_id(self, usuario_id):
        try:
            with get_connection() as conn:
                row = conn.execute(
                    text("SELECT id, nome, numero, senha_hash, tipo FROM usuarios WHERE id = :id"),
                    {"id": usuario_id}
                ).fetchone()
            if row:
                return Usuario(row.id, row.nome, row.numero, row.senha_hash, row.tipo)
        except Exception as e:
            logger.error(f"Erro ao buscar por id: {e}")
        return None


class ContaRepository:
    def salvar_transacoes(self, conta, usuario_id):
        with get_connection() as conn:
            for _, row in conta.dados.iterrows():
                data = row['Data'].date().isoformat()
                tipo = row['Tipo'].strip()
                detalhe = row['Detalhe'].strip()
                credito = float(row['Crédito (R$)'])
                debito = float(row['Débito (R$)'])

                # INSERT ... ON CONFLICT DO NOTHING substitui o INSERT OR IGNORE do SQLite
                conn.execute(text("""
                    INSERT INTO transacoes (usuario_id, data, tipo, detalhe, credito, debito, categoria)
                    VALUES (:usuario_id, :data, :tipo, :detalhe, :credito, :debito, 'Sem categoria')
                    ON CONFLICT DO NOTHING
                """), {
                    "usuario_id": usuario_id,
                    "data": data,
                    "tipo": tipo,
                    "detalhe": detalhe,
                    "credito": credito,
                    "debito": debito
                })
            conn.commit()

    def salvar_saldos_mensais(self, conta, usuario_id):
        try:
            with get_connection() as conn:
                rows = conn.execute(
                    text("SELECT data, credito, debito FROM transacoes WHERE usuario_id = :usuario_id"),
                    {"usuario_id": usuario_id}
                ).fetchall()

                if not rows:
                    return

                df = pd.DataFrame(rows, columns=['data', 'credito', 'debito'])
                df['data'] = pd.to_datetime(df['data'])
                df['mes'] = df['data'].dt.to_period('M')

                saldos = df.groupby('mes').agg(
                    total_credito=('credito', 'sum'),
                    total_debito=('debito', 'sum')
                ).reset_index()
                saldos['saldo'] = saldos['total_credito'] - saldos['total_debito']

                with conn.begin():
                    conn.execute(text("DELETE FROM saldos_mensais WHERE usuario_id = :usuario_id"),
                                 {"usuario_id": usuario_id})
                    for _, row in saldos.iterrows():
                        conn.execute(text("""
                            INSERT INTO saldos_mensais (usuario_id, mes, total_credito, total_debito, saldo)
                            VALUES (:usuario_id, :mes, :total_credito, :total_debito, :saldo)
                        """), {
                            "usuario_id": usuario_id,
                            "mes": str(row['mes']),
                            "total_credito": row['total_credito'],
                            "total_debito": row['total_debito'],
                            "saldo": row['saldo']
                        })
        except Exception as e:
            logger.error(f"Erro ao salvar saldos mensais: {e}")

    def buscar_saldos_mensais(self, usuario_id):
        try:
            with get_connection() as conn:
                rows = conn.execute(text("""
                    SELECT mes, total_credito, total_debito, saldo
                    FROM saldos_mensais
                    WHERE usuario_id = :usuario_id
                    ORDER BY mes
                """), {"usuario_id": usuario_id}).fetchall()
            return [
                {"mes": r.mes, "total_credito": r.total_credito,
                 "total_debito": r.total_debito, "saldo": r.saldo}
                for r in rows
            ]
        except Exception as e:
            logger.error(f"Erro ao buscar saldos mensais: {e}")

    def buscar_total_anual(self, usuario_id):
        try:
            with get_connection() as conn:
                row = conn.execute(text("""
                    SELECT COALESCE(SUM(credito), 0) AS total
                    FROM transacoes
                    WHERE usuario_id = :usuario_id
                      AND EXTRACT(YEAR FROM data::date) = EXTRACT(YEAR FROM CURRENT_DATE)
                      AND categoria = 'Receita'
                """), {"usuario_id": usuario_id}).fetchone()
            return row.total if row else 0.0
        except Exception as e:
            logger.error(f"Erro ao buscar total anual: {e}")
            return 0.0

    def buscar_transacoes(self, usuario_id):
        try:
            with get_connection() as conn:
                rows = conn.execute(text("""
                    SELECT id, data, tipo, detalhe, credito, debito, categoria
                    FROM transacoes
                    WHERE usuario_id = :usuario_id
                    ORDER BY data DESC
                """), {"usuario_id": usuario_id}).fetchall()
            return [row._mapping for row in rows]
        except Exception as e:
            logger.error(f"Erro ao buscar transações: {e}")
            return []

    def buscar_transacao_por_id(self, transacao_id, usuario_id):
        try:
            with get_connection() as conn:
                row = conn.execute(text("""
                    SELECT id, tipo, detalhe, categoria
                    FROM transacoes
                    WHERE id = :id AND usuario_id = :usuario_id
                """), {"id": transacao_id, "usuario_id": usuario_id}).fetchone()
        except Exception as e:
            logger.error(f"Erro ao buscar transações: {e}")
        return dict(row._mapping) if row else None

    def atualizar_categoria(self, transacao_id, categoria, usuario_id):
        with get_connection() as conn:
            conn.execute(text("""
                UPDATE transacoes SET categoria = :categoria
                WHERE id = :id AND usuario_id = :usuario_id
            """), {"categoria": categoria, "id": transacao_id, "usuario_id": usuario_id})
            conn.commit()

    def atualizar_categoria_em_lote(self, tipo, detalhe, categoria, usuario_id):
        try:
            with get_connection() as conn:
                result = conn.execute(text("""
                    UPDATE transacoes
                    SET categoria = :categoria
                    WHERE usuario_id = :usuario_id
                      AND tipo = :tipo
                      AND detalhe = :detalhe
                """), {"categoria": categoria, "usuario_id": usuario_id, "tipo": tipo, "detalhe": detalhe})
                conn.commit()
            return result.rowcount
        except Exception as e:
            logger.error(f"Erro ao atualizar os dados: {e}")
            return 0

class InvestimentoRepository:

    def buscar_por_usuario(self, usuario_id):
        try:
            with get_connection() as conn:
                rows = conn.execute(text("""
                    SELECT id, usuario_id, saldo, descricao
                    FROM investimentos
                    WHERE usuario_id = :usuario_id
                """), {"usuario_id": usuario_id}).fetchall()
            return [dict(row._mapping) for row in rows]
        except Exception as e:
            logger.error(f"Erro na busca: {e}")
            return []

    def salvar(self, usuario_id, saldo, papel, descricao='Sem descrição'):
        try:
            with get_connection() as conn:
                conn.execute(text("""
                    INSERT INTO investimentos (usuario_id, saldo, papel, descricao)
                    VALUES (:usuario_id, :saldo, :papel, :descricao)
                """), {"usuario_id": usuario_id, "saldo": saldo, "papel": papel, "descricao": descricao})
                conn.commit()
        except Exception as e:
            logger.error(f"Erro ao salvar: {e}")


    def remover(self, investimento_id, usuario_id):
        try:
            with get_connection() as conn:
                conn.execute(text("""
                    DELETE FROM investimentos
                    WHERE id = :id AND usuario_id = :usuario_id
                """), {"id": investimento_id, "usuario_id": usuario_id})
                conn.commit()
        except Exception as e:
            logger.error(f"Erro ao tentar remover: {e}")
