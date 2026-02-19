import pandas as pd
import re

class Conta:
    def __init__(self, dados: pd.DataFrame = None, nome: str = None, numero: str = None):
        self.dados = dados if dados is not None else pd.DataFrame()
        self.nome = nome
        self.numero = numero
        self.saldos_mensais = pd.DataFrame()

    @staticmethod
    def validar_numero(numero: str) -> bool:
        return bool(re.fullmatch(r'\d{7}-\d', numero))

    def recalcular_saldo_do_banco(self, todas_transacoes: pd.DataFrame):
        """Calcula o saldo mensal a partir das transações (DataFrame)."""
        if todas_transacoes.empty:
            self.saldos_mensais = pd.DataFrame(columns=['mes', 'total_credito', 'total_debito', 'saldo'])
            return

        todas_transacoes['mes'] = pd.to_datetime(todas_transacoes['data']).dt.to_period('M')
        saldos = todas_transacoes.groupby('mes').agg(
            total_credito=pd.NamedAgg(column='credito', aggfunc='sum'),
            total_debito=pd.NamedAgg(column='debito', aggfunc='sum')
        ).reset_index()
        saldos['saldo'] = saldos['total_credito'] - saldos['total_debito']
        saldos['mes'] = saldos['mes'].astype(str)
        self.saldos_mensais = saldos

    def alimentar(self, dados: pd.DataFrame):
        """Recebe dados de qualquer fonte (Excel, CSV, DB...)."""
        self.dados = dados

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
        for _, row in self.saldos_mensais.iterrows():
            print(
                f"{row['mes']:<15} R$ {row['total_debito']:>11.2f} "
                f"R$ {row['total_credito']:>11.2f} R$ {row['saldo']:>11.2f}"
            )
