import pandas as pd
import pytest
import io
import sys
from models.main import Conta

# -------------------------------------------------
# Função auxiliar para criar dados
# -------------------------------------------------
def criar_dados_exemplo():
    return pd.DataFrame({
        'Data': pd.to_datetime([
            '2024-01-10',
            '2024-01-15',
            '2024-02-05'
        ]),
        'Tipo': ['Pix', 'Boleto', 'Cartão'],
        'Detalhe': ['Cliente A', 'Internet', 'Supermercado'],
        'Crédito (R$)': [1000, 500, 200],
        'Débito (R$)': [200, 100, 50]
    })

# -------------------------------------------------
# TESTES
# -------------------------------------------------

def test_numero_conta_valido():
    # Número válido
    c = Conta("Teste", "1234567-8")
    assert c.numero == "1234567-8"

    # Números inválidos
    with pytest.raises(ValueError):
        Conta("Teste", "12345678")

    with pytest.raises(ValueError):
        Conta("Teste", "1234567-89")


def test_alimentar():
    dados = criar_dados_exemplo()
    conta = Conta("João", "1234567-1")
    conta.alimentar(dados)

    # Garantir que os dados sejam iguais (ignorando índice)
    assert conta.dados.reset_index(drop=True).equals(dados.reset_index(drop=True))


def test_calcular_saldo_mensal():
    dados = criar_dados_exemplo()
    conta = Conta("João", "1234567-1")
    conta.alimentar(dados)
    conta.calcular_saldo_mensal()

    jan = conta.saldos_mensais.loc[pd.Period('2024-01', 'M')]
    fev = conta.saldos_mensais.loc[pd.Period('2024-02', 'M')]

    assert jan['total_credito'] == 1500
    assert jan['total_debito'] == 300
    assert jan['saldo'] == 1200

    assert fev['total_credito'] == 200
    assert fev['total_debito'] == 50
    assert fev['saldo'] == 150


def test_recalcular_saldo_do_banco():
    registros = [
        {"data": "2024-01-10", "credito": 1000, "debito": 200},
        {"data": "2024-01-15", "credito": 500, "debito": 100},
        {"data": "2024-02-05", "credito": 200, "debito": 50},
    ]

    conta = Conta("Maria", "7654321-0")
    conta.recalcular_saldo_do_banco(registros)

    jan = conta.saldos_mensais.loc[pd.Period('2024-01', 'M')]
    fev = conta.saldos_mensais.loc[pd.Period('2024-02', 'M')]

    assert jan['saldo'] == 1200
    assert fev['saldo'] == 150


def test_exibir_transacoes():
    dados = criar_dados_exemplo()
    conta = Conta("João", "1234567-1")
    conta.alimentar(dados)

    captured_output = io.StringIO()
    sys.stdout = captured_output
    conta.exibir_transacoes()
    sys.stdout = sys.__stdout__

    output = captured_output.getvalue()
    assert "Pix" in output
    assert "Boleto" in output
    assert "Cartão" in output


def test_exibir_saldos():
    dados = criar_dados_exemplo()
    conta = Conta("João", "1234567-1")
    conta.alimentar(dados)
    conta.calcular_saldo_mensal()

    captured_output = io.StringIO()
    sys.stdout = captured_output
    conta.exibir_saldos()
    sys.stdout = sys.__stdout__

    output = captured_output.getvalue()
    assert "2024-01" in output
    assert "2024-02" in output
    assert "1200" in output
    assert "150" in output
