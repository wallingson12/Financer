import pandas as pd
from infrastructure.loader import ExcelLoader
from models.main import Conta
from typing import Protocol


class ContaRepositoryProtocol(Protocol):
    def salvar_transacoes(self, conta: Conta, usuario_id: int) -> None: ...
    def buscar_transacoes(self, usuario_id: int) -> list: ...
    def salvar_saldos_mensais(self, conta: Conta, usuario_id: int) -> None: ...


class ContaService:
    """Serviço responsável por processar uploads de extratos e persistir transações e saldos."""

    def __init__(self, conta_repo: ContaRepositoryProtocol, loader_cls=ExcelLoader) -> None:
        """
        Inicializa o serviço com o repositório de contas e o loader de arquivos.

        :param conta_repo: Repositório que implementa ContaRepositoryProtocol.
        :param loader_cls: Classe responsável por carregar o arquivo (padrão: ExcelLoader).
        """
        self._conta_repo = conta_repo
        self._loader_cls = loader_cls

    def processar_upload(self, arquivo, usuario) -> Conta:
        """
        Processa o upload de um extrato bancário, filtra transações duplicadas
        e persiste apenas as novas, recalculando os saldos mensais.

        :param arquivo: Arquivo de extrato enviado pelo usuário (CSV ou Excel).
        :param usuario: Objeto do usuário autenticado com atributos id, nome e numero.
        :return: Objeto Conta atualizado com os dados processados.
        """
        loader = self._loader_cls(arquivo)
        dados = loader.carregar()

        conta = Conta(nome=usuario.nome, numero=usuario.numero)
        conta.alimentar(dados)

        usuario_id = usuario.id

        existentes = self._conta_repo.buscar_transacoes(usuario_id)

        if existentes:
            existentes = pd.DataFrame(existentes)
            if 'data' in existentes.columns:
                existentes['data'] = pd.to_datetime(existentes['data'], errors='coerce')
            else:
                existentes['data'] = pd.NaT
        else:
            existentes = pd.DataFrame(columns=['data', 'tipo', 'detalhe', 'credito', 'debito'])

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
            conta.recalcular_saldo_do_banco(pd.DataFrame(novas))

        self._conta_repo.salvar_saldos_mensais(conta, usuario_id)

        return conta