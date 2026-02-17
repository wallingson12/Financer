import pandas as pd


class ExcelLoader():
    def __init__(self, arquivo_excel):
        self.arquivo_excel = arquivo_excel

    def _converter_valor(self, coluna):
        if coluna.dtype in ['float64', 'int64']:
            return coluna.abs().fillna(0)
        return pd.to_numeric(
            coluna.astype(str).str.replace('.', '').str.replace(',', '.').str.strip(),
            errors='coerce'
        ).abs().fillna(0)

    def carregar(self):
        dados = pd.read_excel(self.arquivo_excel)
        dados.columns = dados.columns.str.strip()

        dados['Data'] = pd.to_datetime(dados['Data'].astype(str).str.strip(), dayfirst=True)

        dados['Crédito (R$)'] = self._converter_valor(dados['Crédito (R$)'])
        dados['Débito (R$)'] = self._converter_valor(dados['Débito (R$)'])

        # SPLIT robusto
        split_cols = dados['Descrição'].str.split(r'\s{2,}', n=1, expand=True)

        # Se o split retornar só 1 coluna, cria a segunda como ''
        if split_cols.shape[1] == 1:
            split_cols[1] = ''

        split_cols.columns = ['Tipo', 'Detalhe']
        dados[['Tipo', 'Detalhe']] = split_cols

        # Garante que não haja NaN em 'Detalhe'
        dados['Detalhe'] = dados['Detalhe'].fillna('')

        return dados
