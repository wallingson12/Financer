# 💰 Financer

Aplicação web para controle de extratos bancários pessoais, construída com **Flask**, **SQLite** e **pandas**.

## Funcionalidades

- Cadastro de usuários e autenticação segura com Flask-Login
- Importação de extratos bancários em **Excel (.xlsx)**
- Cálculo automático de saldos mensais (crédito, débito e saldo)
- Dashboard com gráfico interativo de evolução financeira por mês
- Listagem de transações com filtro por mês
- Categorização de lançamentos individualmente ou em lote
- Gestão de investimentos por papel

---

## Estrutura do projeto
```
Financer/
├── app.py
├── models/
│   ├── main.py
│   └── usuario.py
├── repositories/
│   └── repository.py
├── services/
│   └── conta_service.py
├── infrastructure/
│   ├── database.py
│   └── loader.py
├── templates/
│   ├── base.html
│   ├── dashboard.html
│   ├── transacoes.html
│   ├── investimentos.html
│   ├── index.html
│   ├── login.html
│   └── registro.html
└── static/
    └── css/
        └── style.css
```

---

## Requisitos

- Python 3.10+
- Pacotes:
```bash
pip install flask flask-login pandas openpyxl
```

---

## Como rodar
```bash
python app.py
```

- O banco de dados SQLite (`financer.db`) é criado automaticamente na primeira execução.
- As tabelas são criadas via `criar_tabelas()` em `infrastructure/database.py`.

### Fluxo principal

1. Acesse `/registro` para criar uma conta.
2. Faça login em `/login`.
3. Vá em **Importar** e envie um `.xlsx` no formato esperado.
4. Visualize no **Dashboard** os totais de crédito, débito e saldo com gráfico por mês.
5. Em **Transações**, filtre por mês e categorize os lançamentos.
6. Em **Investimentos**, registre e acompanhe seus papéis.

---

## Formato do arquivo Excel

| Coluna | Descrição |
|---|---|
| **Data** | Data da transação (DD/MM/YYYY) |
| **Descrição** | Descrição completa — dividida automaticamente em `Tipo` e `Detalhe` |
| **Crédito (R$)** | Valor creditado (deixe vazio se for débito) |
| **Débito (R$)** | Valor debitado (deixe vazio se for crédito) |

---

## Categorias disponíveis

`Sem categoria` · `Alimentação` · `Transporte` · `Saúde` · `Lazer` · `Educação` · `Moradia` · `Receita` · `Outros` · `Cartão` · `DAS`

---

## Segurança

A `SECRET_KEY` é lida de variável de ambiente:
```python
app.config["SECRET_KEY"] = os.environ.get("FINANCER_SECRET_KEY", "dev-financer-secret")
```

Em produção, defina `FINANCER_SECRET_KEY` com um valor seguro e nunca faça commit de chaves sensíveis.
