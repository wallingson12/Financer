import pandas as pd
import magic  # pip install python-magic


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_ROWS = 100_000
COLUNAS_OBRIGATORIAS = {'Data', 'Crédito (R$)', 'Débito (R$)', 'Descrição'}
ALLOWED_MIMES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
}


class ExcelLoader:
    def __init__(self, arquivo_excel):
        self.arquivo_excel = arquivo_excel

    def carregar(self):
        self._validar_tamanho()
        self._validar_tipo()

        dados = pd.read_excel(self.arquivo_excel, sheet_name=0, nrows=MAX_ROWS)
        dados.columns = dados.columns.str.strip()

        ausentes = COLUNAS_OBRIGATORIAS - set(dados.columns)
        if ausentes:
            raise ValueError(f"Colunas ausentes no arquivo: {ausentes}")

        dados['Data'] = pd.to_datetime(
            dados['Data'].astype(str).str.strip(), dayfirst=True
        )

        dados['Crédito (R$)'] = pd.to_numeric(
            dados['Crédito (R$)'].astype(str)
                .str.replace('.', '', regex=False)
                .str.replace(',', '.', regex=False)
                .str.strip(),
            errors='coerce'
        ).fillna(0)

        dados['Débito (R$)'] = pd.to_numeric(
            dados['Débito (R$)'].astype(str)
                .str.replace('.', '', regex=False)
                .str.replace(',', '.', regex=False)
                .str.strip(),
            errors='coerce'
        ).fillna(0).abs()

        dados[['Tipo', 'Detalhe']] = dados['Descrição'].str.split(
            r'\s{2,}', n=1, expand=True
        )
        dados['Detalhe'] = dados['Detalhe'].fillna('')

        dados = dados.rename(columns={
            'Data': 'data',
            'Crédito (R$)': 'credito',
            'Débito (R$)': 'debito',
            'Tipo': 'tipo',
            'Detalhe': 'detalhe',
            'Descrição': 'descricao'
        })

        return dados

    def _validar_tamanho(self):
        self.arquivo_excel.seek(0, 2)
        size = self.arquivo_excel.tell()
        self.arquivo_excel.seek(0)
        if size > MAX_FILE_SIZE:
            raise ValueError("Arquivo muito grande. Limite: 5MB.")

    def _validar_tipo(self):
        header = self.arquivo_excel.read(8)
        self.arquivo_excel.seek(0)
        mime = magic.from_buffer(header, mime=True)
        if mime not in ALLOWED_MIMES:
            raise ValueError("Tipo de arquivo inválido. Envie um .xlsx ou .xls.")