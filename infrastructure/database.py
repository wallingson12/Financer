import sqlite3


def get_connection():
    conn = sqlite3.connect("../financer.db")
    conn.row_factory = sqlite3.Row
    return conn


def criar_tabelas():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            numero TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL
        )
    """)
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
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            UNIQUE(usuario_id, data, tipo, detalhe, credito, debito)
        )
    """)
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