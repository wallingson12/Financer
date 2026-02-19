import sqlite3


def get_connection():
    conn = sqlite3.connect("financer.db")
    conn.row_factory = sqlite3.Row
    return conn


def criar_tabelas():
    conn = get_connection()
    # Tabela de usuários
    conn.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            numero TEXT NOT NULL,
            senha_hash TEXT NOT NULL
        )
    """)
    # Tabela de transações (sem UNIQUE para permitir importações livres)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS transacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            data TEXT,
            tipo TEXT,
            detalhe TEXT,
            credito REAL,
            debito REAL,
            categoria TEXT DEFAULT 'Sem categoria',
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)
    # Tabela de saldos mensais
    conn.execute("""
        CREATE TABLE IF NOT EXISTS saldos_mensais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            mes TEXT,
            total_credito REAL,
            total_debito REAL,
            saldo REAL,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)
    conn.commit()
    conn.close()
