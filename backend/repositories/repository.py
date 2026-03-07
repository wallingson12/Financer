from infrastructure.database import get_connection
from werkzeug.security import generate_password_hash
from models.usuario import Usuario
import pandas as pd


class UsuarioRepository:
    def criar(self, nome, numero, senha, tipo='pessoal'):
        conn = get_connection()
        conn.execute(
            "INSERT INTO usuarios (nome, numero, senha_hash, tipo) VALUES (?, ?, ?, ?)",
            (nome, numero, generate_password_hash(senha), tipo)
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
            return Usuario(row['id'], row['nome'], row['numero'], row['senha_hash'], row['tipo'])
        return None

    def buscar_por_id(self, id):
        conn = get_connection()
        row = conn.execute(
            "SELECT * FROM usuarios WHERE id = ?", (id,)
        ).fetchone()
        conn.close()
        if row:
            return Usuario(row['id'], row['nome'], row['numero'], row['senha_hash'], row['tipo'])
        return None


class ContaRepository:
    def salvar_transacoes(self, conta, usuario_id):
        conn = get_connection()
        for _, row in conta.dados.iterrows():
            data = row['Data'].date().isoformat()
            tipo = row['Tipo'].strip()
            detalhe = row['Detalhe'].strip()
            credito = float(row['Crédito (R$)'])
            debito = float(row['Débito (R$)'])

            conn.execute("""
                INSERT OR IGNORE INTO transacoes
                (usuario_id, data, tipo, detalhe, credito, debito, categoria)
                VALUES (?, ?, ?, ?, ?, ?, 'Sem categoria')
            """, (usuario_id, data, tipo, detalhe, credito, debito))

        conn.commit()
        conn.close()

    def salvar_saldos_mensais(self, conta, usuario_id):
        conn = get_connection()

        df = pd.DataFrame(conn.execute("""
            SELECT data, credito, debito FROM transacoes
            WHERE usuario_id = ?
        """, (usuario_id,)).fetchall(), columns=['data', 'credito', 'debito'])

        if df.empty:
            conn.close()
            return

        df['data'] = pd.to_datetime(df['data'])
        df['mes'] = df['data'].dt.to_period('M')

        saldos = df.groupby('mes').agg(
            total_credito=('credito', 'sum'),
            total_debito=('debito', 'sum')
        ).reset_index()

        saldos['saldo'] = saldos['total_credito'] - saldos['total_debito']

        conn.execute("DELETE FROM saldos_mensais WHERE usuario_id = ?", (usuario_id,))

        for _, row in saldos.iterrows():
            conn.execute("""
                INSERT INTO saldos_mensais (usuario_id, mes, total_credito, total_debito, saldo)
                VALUES (?, ?, ?, ?, ?)
            """, (
                usuario_id,
                str(row['mes']),
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
        return [
            {"mes": r["mes"], "total_credito": r["total_credito"],
             "total_debito": r["total_debito"], "saldo": r["saldo"]}
            for r in rows
        ]

    def buscar_total_anual(self, usuario_id):
        """Busca total de créditos do ano atual para cálculo do limite MEI"""
        conn = get_connection()
        row = conn.execute("""
            SELECT COALESCE(SUM(credito), 0) as total
            FROM transacoes
            WHERE usuario_id = ?
              AND strftime('%Y', data) = strftime('%Y', 'now')
              AND categoria = 'Receita'
        """, (usuario_id,)).fetchone()
        conn.close()
        return row['total']

    def buscar_transacoes(self, usuario_id):
        """Busca transações e retorna lista de dicionários"""
        conn = get_connection()
        rows = conn.execute("""
            SELECT id, data, tipo, detalhe, credito, debito, categoria
            FROM transacoes
            WHERE usuario_id = ?
            ORDER BY data DESC
        """, (usuario_id,)).fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def buscar_transacao_por_id(self, transacao_id, usuario_id):
        """Busca uma transação específica por ID"""
        conn = get_connection()
        row = conn.execute("""
            SELECT id, tipo, detalhe, categoria
            FROM transacoes
            WHERE id = ? AND usuario_id = ?
        """, (transacao_id, usuario_id)).fetchone()
        conn.close()
        return dict(row) if row else None

    def atualizar_categoria(self, transacao_id, categoria, usuario_id):
        """Atualiza categoria de uma transação"""
        conn = get_connection()
        conn.execute("""
            UPDATE transacoes SET categoria = ?
            WHERE id = ? AND usuario_id = ?
        """, (categoria, transacao_id, usuario_id))
        conn.commit()
        conn.close()

    def atualizar_categoria_em_lote(self, tipo, detalhe, categoria, usuario_id):
        """Atualiza categoria de todas as transações com mesmo tipo e detalhe"""
        conn = get_connection()
        conn.execute("""
            UPDATE transacoes 
            SET categoria = ?
            WHERE usuario_id = ?
              AND tipo = ?
              AND detalhe = ?
        """, (categoria, usuario_id, tipo, detalhe))
        qtd_atualizada = conn.total_changes
        conn.commit()
        conn.close()
        return qtd_atualizada


class InvestimentoRepository:

    def buscar_por_usuario(self, usuario_id):
        """Busca investimentos do usuário"""
        conn = get_connection()
        rows = conn.execute("""
            SELECT id, usuario_id, saldo, descricao
            FROM investimentos
            WHERE usuario_id = ?
        """, (usuario_id,)).fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def salvar(self, usuario_id, saldo, papel, descricao='Sem descrição'):
        """Insere ou atualiza investimento do usuário"""
        conn = get_connection()
        conn.execute("""
            INSERT INTO investimentos (usuario_id, saldo, descricao)
            VALUES (?, ?, ?)
            ON CONFLICT(usuario_id) DO UPDATE SET
                saldo = excluded.saldo,
                descricao = excluded.descricao
        """, (usuario_id, saldo, descricao))
        conn.commit()
        conn.close()

    def remover(self, investimento_id, usuario_id):
        """Remove investimento do usuário"""
        conn = get_connection()
        conn.execute("""
            DELETE FROM investimentos
            WHERE id = ? AND usuario_id = ?
        """, (investimento_id, usuario_id))
        conn.commit()
        conn.close()