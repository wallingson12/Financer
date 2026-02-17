from typing import Protocol, Iterable

from infrastructure.loader import ExcelLoader
from models.main import Conta


class ContaRepositoryProtocol(Protocol):
    def salvar_transacoes(self, conta: Conta, usuario_id: int) -> None: ...
    def buscar_transacoes(self, usuario_id: int) -> Iterable: ...
    def salvar_saldos_mensais(self, conta: Conta, usuario_id: int) -> None: ...


class ContaService:
    def __init__(self, conta_repo: ContaRepositoryProtocol, loader_cls=ExcelLoader) -> None:
        self._conta_repo = conta_repo
        self._loader_cls = loader_cls

    def processar_upload(self, arquivo, usuario) -> Conta:
        loader = self._loader_cls(arquivo)

        conta = Conta(usuario.nome, usuario.numero)
        conta.alimentar(loader.carregar())

        self._conta_repo.salvar_transacoes(conta, usuario.id)

        todas = self._conta_repo.buscar_transacoes(usuario.id)
        conta.recalcular_saldo_do_banco(todas)
        self._conta_repo.salvar_saldos_mensais(conta, usuario.id)

        return conta

