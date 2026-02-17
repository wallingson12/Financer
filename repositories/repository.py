from infrastructure.database import get_connection
from werkzeug.security import generate_password_hash
from models.usuario import Usuario


class UsuarioRepository():
    def criar(self, nome, numero, senha):
        conn = get_connection()
        conn.execute(
            "INSERT INTO usuarios (nome, numero, senha_hash) VALUES (?, ?, ?)",
            (nome, numero, generate_password_hash(senha))
        )
        conn.commit()
        conn.close()

    def buscar_por_numero(self, numero):
        conn = get_connection()
        row = conn.execute(
            "SELECT * FROM usuarios WHERE numero = ?", (numero,)
        ).fetchone()
        conn.close()
        if row:
            return Usuario(row['id'], row['nome'], row['numero'], row['senha_hash'])
        return None

    def buscar_por_id(self, id):
        conn = get_connection()
        row = conn.execute(
            "SELECT * FROM usuarios WHERE id = ?", (id,)
        ).fetchone()
        conn.close()
        if row:
            return Usuario(row['id'], row['nome'], row['numero'], row['senha_hash'])
        return None


class ContaRepository():
    def salvar_transacoes(self, conta, usuario_id):
        conn = get_connection()
        for _, row in conta.dados.iterrows():
            conn.execute("""
                INSERT OR IGNORE INTO transacoes
                (usuario_id, data, tipo, detalhe, credito, debito, categoria)
                VALUES (?, ?, ?, ?, ?, ?, 'Sem categoria')
            """, (
                usuario_id,
                str(row['Data'].date()),
                row['Tipo'],
                row['Detalhe'],
                row['Crédito (R$)'],
                row['Débito (R$)']
            ))
        conn.commit()
        conn.close()

    def salvar_saldos_mensais(self, conta, usuario_id):
        conn = get_connection()
        for mes, row in conta.saldos_mensais.iterrows():
            conn.execute(
                "DELETE FROM saldos_mensais WHERE usuario_id = ? AND mes = ?",
                (usuario_id, str(mes))
            )
            conn.execute("""
                INSERT INTO saldos_mensais (usuario_id, mes, total_credito, total_debito, saldo)
                VALUES (?, ?, ?, ?, ?)
            """, (
                usuario_id,
                str(mes),
                row['total_credito'],
                row['total_debito'],
                row['saldo']
            ))
        conn.commit()
        conn.close()

    def buscar_saldos_mensais(self, usuario_id):
        conn = get_connection()
        rows = conn.execute("""
            SELECT mes, total_credito, total_debito, saldo
            FROM saldos_mensais
            WHERE usuario_id = ?
            ORDER BY mes
        """, (usuario_id,)).fetchall()
        conn.close()
        return rows

    def buscar_transacoes(self, usuario_id):
        conn = get_connection()
        rows = conn.execute("""
            SELECT id, data, tipo, detalhe, credito, debito, categoria
            FROM transacoes
            WHERE usuario_id = ?
            ORDER BY data DESC
        """, (usuario_id,)).fetchall()
        conn.close()
        return rows

    def atualizar_categoria(self, transacao_id, categoria, usuario_id):
        conn = get_connection()
        conn.execute("""
            UPDATE transacoes SET categoria = ?
            WHERE id = ? AND usuario_id = ?
        """, (categoria, transacao_id, usuario_id))
        conn.commit()
        conn.close()