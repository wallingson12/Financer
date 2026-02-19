import pandas as pd


class ExcelLoader():
    def __init__(self, arquivo_excel):
        self.arquivo_excel = arquivo_excel

    def carregar(self):
        dados = pd.read_excel(self.arquivo_excel)
        dados.columns = dados.columns.str.strip()

        dados['Data'] = pd.to_datetime(dados['Data'].astype(str).str.strip(), dayfirst=True)

        dados['Crédito (R$)'] = pd.to_numeric(
            dados['Crédito (R$)'].astype(str).str.replace('.', '').str.replace(',', '.').str.strip(),
            errors='coerce').fillna(0)

        dados['Débito (R$)'] = pd.to_numeric(
            dados['Débito (R$)'].astype(str).str.replace('.', '').str.replace(',', '.').str.strip(),
            errors='coerce').fillna(0).abs()

        dados[['Tipo', 'Detalhe']] = dados['Descrição'].str.split(r'\s{2,}', n=1, expand=True)
        dados['Detalhe'] = dados['Detalhe'].fillna('')
        print(dados[['Data', 'Tipo', 'Detalhe', 'Crédito (R$)', 'Débito (R$)']])
        print("Linhas totais:", len(dados))

        return dados
