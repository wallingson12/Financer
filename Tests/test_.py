import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
import pytest
import io
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

def test_criar_conta():
    c = Conta("Teste", "1234567-8")
    assert isinstance(c, Conta)


def test_alimentar():
    dados = criar_dados_exemplo()
    conta = Conta("João", "1234567-1")

    conta.alimentar(dados)

    assert conta.dados is not None
    assert len(conta.dados) == 3


def test_recalcular_saldo_do_banco():
    registros = pd.DataFrame([
        {"data": "2024-01-10", "credito": 1000, "debito": 200},
        {"data": "2024-01-15", "credito": 500, "debito": 100},
        {"data": "2024-02-05", "credito": 200, "debito": 50},
    ])

    conta = Conta("Maria", "7654321-0")

    conta.recalcular_saldo_do_banco(registros)

    assert conta.saldos_mensais is not None


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
    registros = pd.DataFrame([
        {"data": "2024-01-10", "credito": 1000, "debito": 200},
        {"data": "2024-01-15", "credito": 500, "debito": 100},
    ])

    conta = Conta("Maria", "7654321-0")
    conta.recalcular_saldo_do_banco(registros)

    captured_output = io.StringIO()
    sys.stdout = captured_output

    conta.exibir_saldos()

    sys.stdout = sys.__stdout__

    output = captured_output.getvalue()

    assert output != ""