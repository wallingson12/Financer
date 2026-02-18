# Financer

Aplicação web simples para controle de extratos bancários, construída com **Flask**, **SQLite** e **pandas**.  
Permite:

- Criar usuários e fazer login
- Importar arquivos de extrato em **Excel (.xlsx)**
- Calcular saldos mensais (crédito, débito e saldo)
- Visualizar gráfico com evolução de saldos
- Listar transações e categorizar cada lançamento

---

## Estrutura do projeto

```
Financer/
├── app.py                    # Ponto de entrada da aplicação Flask
├── models/                   # Modelos de domínio
│   ├── main.py              # Classe Conta (regras de cálculo de saldo)
│   └── usuario.py           # Modelo Usuario integrado ao flask_login
├── repositories/             # Acesso a dados
│   └── repository.py        # UsuarioRepository e ContaRepository
├── services/                # Camada de serviços
│   └── conta_service.py     # ContaService (orquestração de regras de negócio)
├── infrastructure/           # Infraestrutura e utilitários
│   ├── database.py          # Conexão e criação das tabelas SQLite
│   └── loader.py            # Leitura e normalização do arquivo Excel
├── templates/                # Templates HTML (Jinja2)
│   ├── base.html
│   ├── dashboard.html
│   ├── transacoes.html
│   ├── index.html
│   ├── login.html
│   └── registro.html
└── static/                   # Arquivos estáticos
    └── style.css            # Estilos da aplicação
```

---

## Requisitos

- Python 3.10+ (recomendado)
- Pacotes Python:
  - `flask`
  - `flask-login`
  - `pandas`
  - `openpyxl`

Instalação rápida (em um ambiente virtual, recomendado):

```bash
pip install flask flask-login pandas openpyxl
```

---

## Como rodar

Na pasta principal do projeto (`Financer`):

```bash
python app.py
```

Por padrão:

- O banco de dados SQLite será criado no arquivo `financer.db` na raiz do projeto.
- As tabelas são criadas automaticamente na primeira execução (`criar_tabelas()` em `infrastructure/database.py`).

### Fluxo principal

1. Acesse `http://127.0.0.1:5000/registro` para criar uma conta.
2. Faça login em `http://127.0.0.1:5000/login`.
3. Vá em **Importar** e envie um `.xlsx` no formato esperado pelo `loader.py` (colunas `Data`, `Descrição`, `Crédito (R$)`, `Débito (R$)`).
4. Veja o dashboard com:
   - Total de créditos, débitos e saldo
   - Gráfico por mês
5. Acesse **Transações** para listar os lançamentos e atribuir categorias.

---

## Formato do arquivo Excel

O arquivo Excel deve conter as seguintes colunas:

- **Data** – Data da transação (formato brasileiro: DD/MM/YYYY)
- **Descrição** – Descrição completa da transação (será dividida em `Tipo` e `Detalhe` automaticamente)
- **Crédito (R$)** – Valor creditado (deixe vazio se for débito)
- **Débito (R$)** – Valor debitado (deixe vazio se for crédito)

---

## Categorias disponíveis

- Sem categoria
- Alimentação
- Transporte
- Saúde
- Lazer
- Educação
- Moradia
- Receita
- Outros
- Cartão
- DAS

---

## Notas sobre segurança

A aplicação usa variável de ambiente para o `SECRET_KEY`:

```python
app.config["SECRET_KEY"] = os.environ.get("FINANCER_SECRET_KEY", "dev-financer-secret")
```

Para uso em produção, configure a variável de ambiente `FINANCER_SECRET_KEY` com um valor seguro e nunca faça commit de chaves sensíveis.
