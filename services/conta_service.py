from typing import Protocol
import pandas as pd
from infrastructure.loader import ExcelLoader
from models.main import Conta

class ContaRepositoryProtocol(Protocol):
    def salvar_transacoes(self, conta: Conta, usuario_id: int) -> None: ...
    def buscar_transacoes(self, usuario_id: int) -> pd.DataFrame: ...
    def salvar_saldos_mensais(self, conta: Conta, usuario_id: int) -> None: ...


class ContaService:
    def __init__(self, conta_repo: ContaRepositoryProtocol, loader_cls=ExcelLoader) -> None:
        self._conta_repo = conta_repo
        self._loader_cls = loader_cls

    def processar_upload(self, arquivo, usuario) -> Conta:
        loader = self._loader_cls(arquivo)
        dados = loader.carregar()  # retorna DataFrame

        conta = Conta(nome=usuario.nome, numero=usuario.numero)
        conta.alimentar(dados)

        usuario_id = usuario.id
        existentes = self._conta_repo.buscar_transacoes(usuario_id)
        existentes['data'] = pd.to_datetime(existentes['data'], errors='coerce')

        novas = []
        for _, row in conta.dados.iterrows():
            row_data = pd.to_datetime(row['Data'], errors='coerce')

            existente_mes = existentes[
                (existentes['data'].dt.month == row_data.month) &
                (existentes['data'].dt.year == row_data.year)
                ]

            if not ((existente_mes['tipo'] == row['Tipo']) &
                    (existente_mes['detalhe'] == row['Detalhe']) &
                    (existente_mes['credito'] == row['Crédito (R$)']) &
                    (existente_mes['debito'] == row['Débito (R$)'])).any():
                novas.append(row)

        if novas:
            conta_novas = Conta(nome=conta.nome, numero=conta.numero)
            conta_novas.alimentar(pd.DataFrame(novas))
            self._conta_repo.salvar_transacoes(conta_novas, usuario_id)

            # Recalcula saldo apenas com as novas
            conta.recalcular_saldo_do_banco(pd.DataFrame(novas))

        self._conta_repo.salvar_saldos_mensais(conta, usuario_id)
        return conta


