import sqlite3
import pandas as pd

# Caminho do seu arquivo DB
DB_PATH = "financer.db"

# Conectar
conn = sqlite3.connect(DB_PATH)

# Ler tabela de transações
df_transacoes = pd.read_sql_query("SELECT * FROM transacoes", conn)

# Ler tabela de saldos mensais
df_saldos = pd.read_sql_query("SELECT * FROM saldos_mensais", conn)

# Mostrar
print("Transações:")
print(df_transacoes)

print("\nSaldos mensais:")
print(df_saldos)

conn.close()
