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

df_user = pd.read_sql_query("SELECT *  FROM usuarios", conn)

# Mostrar
print("Transações:")
print(df_transacoes)
print('')

print("\nSaldos mensais:")
print(df_saldos)
print('')

print(df_user)

conn.close()
