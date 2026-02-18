import re

class Conta():
    @staticmethod
    def validar_numero(numero):
        return bool(re.fullmatch(r"\d{7}-\d", numero))

    def __init__(self, nome, numero):

        # Validação: deve ser 7 dígitos + '-' + 1 dígito
        if not self.validar_numero(numero):
            raise ValueError(f"Número de conta inválido: {numero}")

        self.nome = nome
        self.numero = numero
        self.dados = None
        self.saldos_mensais = {}

    def alimentar(self, dados):
        """Recebe dados de qualquer fonte (Excel, CSV, DB...)"""
        self.dados = dados

    def calcular_saldo_mensal(self):
        self.dados['Mês'] = self.dados['Data'].dt.to_period('M')

        resumo = self.dados.groupby('Mês').agg(
            total_credito=('Crédito (R$)', 'sum'),
            total_debito=('Débito (R$)', 'sum')
        )
        resumo['saldo'] = resumo['total_credito'] - resumo['total_debito']
        self.saldos_mensais = resumo

    def exibir_transacoes(self):
        print(f"{'Data':<15} {'Tipo':<30} {'Detalhe':<35} {'Crédito':>12} {'Débito':>12}")
        print("-" * 110)
        for _, row in self.dados.iterrows():
            print(
                f"{str(row['Data'].date()):<15} {row['Tipo']:<30} {row['Detalhe']:<35} "
                f"R$ {row['Crédito (R$)']:>8.2f} R$ {row['Débito (R$)']:>8.2f}"
            )

    def exibir_saldos(self):
        print(f"\n{'Mês':<15} {'Débito':>15} {'Crédito':>15} {'Saldo':>15}")
        print("-" * 60)
        for mes, row in self.saldos_mensais.iterrows():
            print(
                f"{str(mes):<15} R$ {row['total_debito']:>11.2f} "
                f"R$ {row['total_credito']:>11.2f} R$ {row['saldo']:>11.2f}"
            )

    def recalcular_saldo_do_banco(self, registros):
        """Recalcula saldo mensal usando todos os registros do banco"""
        import pandas as pd

        df = pd.DataFrame([dict(r) for r in registros])
        df['data'] = pd.to_datetime(df['data'])
        df['mes'] = df['data'].dt.to_period('M')

        resumo = df.groupby('mes').agg(
            total_credito=('credito', 'sum'),
            total_debito=('debito', 'sum')
        )
        resumo['saldo'] = resumo['total_credito'] - resumo['total_debito']
        self.saldos_mensais = resumo