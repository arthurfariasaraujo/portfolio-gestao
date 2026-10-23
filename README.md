# Portfólio + Sistema de Gestão

Projeto de estudo para portfólio profissional, com site público e uma área administrativa que usa banco de dados MySQL.

## Funcionalidades

- Página inicial com apresentação e projetos.
- Página Sobre e página Contato.
- Área administrativa protegida por login.
- Dashboard com contagem de projetos e tarefas.
- Cadastro e exclusão de projetos do portfólio.
- Cadastro de tarefas, alteração de status e exclusão.
- Layout responsivo para desktop e celular.
- Dados persistidos no MySQL.

## Tecnologias

- Front-end: HTML, CSS e JavaScript.
- Back-end: Python + Flask.
- Banco de dados: MySQL.
- ORM: Flask-SQLAlchemy.
- Conector MySQL: PyMySQL.

## Requisitos

- Python 3.10 ou superior.
- MySQL Server instalado e em execução.
- Terminal (PowerShell, CMD ou terminal do VS Code).

## 1. Criar o banco de dados

Abra o MySQL Workbench ou o terminal do MySQL e execute:

```sql
CREATE DATABASE portfolio_gestao
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

No MySQL Workbench, conecte ao servidor local, abra uma nova aba SQL, cole o comando e clique no raio para executar.

## 2. Abrir o projeto no VS Code

Extraia a pasta do ZIP. No VS Code, selecione **Arquivo > Abrir Pasta** e escolha `portfolio_gestao`.

## 3. Criar ambiente virtual

No terminal integrado do VS Code, execute:

### Windows (PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Se o PowerShell bloquear a ativação, use o CMD no terminal:

```bat
.venv\Scripts\activate.bat
```

## 4. Instalar dependências

```bash
python -m pip install -r requirements.txt
```

## 5. Configurar as variáveis

Copie `.env.example` para um arquivo chamado `.env` na raiz do projeto.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abra `.env` e ajuste:
- `SUA_SENHA` para a senha real do seu usuário MySQL.
- `SECRET_KEY` para uma chave longa e aleatória.
- `ADMIN_USERNAME` e `ADMIN_PASSWORD` para as credenciais administrativas.

Não envie o arquivo `.env` para o GitHub: ele contém credenciais.

Exemplo de URL se o usuário MySQL for `root`:

```text
DATABASE_URL=mysql+pymysql://root:minha_senha@localhost/portfolio_gestao?charset=utf8mb4
```

Se a senha tiver caracteres especiais como `@`, `#`, `/` ou `:`, eles precisam ser codificados para URL. Para começar, você pode usar uma senha de desenvolvimento sem esses caracteres.

## 6. Criar as tabelas

Com o ambiente virtual ativado, execute:

```bash
flask --app app init-db
```

## 7. Inserir projetos de exemplo

```bash
flask --app app seed
```

O comando não duplica os exemplos se já houver projetos cadastrados.

## 8. Executar o site

```bash
flask --app app run --debug
```

Abra no navegador:

- Site público: http://127.0.0.1:5000
- Login administrativo: http://127.0.0.1:5000/admin/login

Use as credenciais definidas no `.env`.

## Rotas principais

| Rota | Finalidade |
|---|---|
| `/` | Portfólio público |
| `/sobre` | Apresentação |
| `/contato` | Informações de contato |
| `/admin/login` | Login |
| `/admin` | Dashboard |
| `/admin/projetos` | Gerenciar projetos |
| `/admin/tarefas` | Gerenciar tarefas |

## Como personalizar o portfólio

1. Abra `templates/index.html` e ajuste o título, a apresentação e os textos.
2. Abra `templates/sobre.html` e descreva sua formação, competências e objetivos.
3. Abra `templates/contato.html` e substitua os links de exemplo por seus links reais.
4. Na área administrativa, cadastre projetos reais e marque os destaques.
5. Edite `static/css/style.css` para personalizar cores e aparência.

## Estrutura do projeto

```text
portfolio_gestao/
├── app.py
├── requirements.txt
├── .env.example
├── schema.sql
├── README.md
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── sobre.html
│   ├── contato.html
│   ├── login.html
│   ├── dashboard.html
│   ├── admin_projects.html
│   └── admin_tasks.html
└── static/
    ├── css/style.css
    └── js/main.js
```

## Observações importantes de segurança

Este é um projeto educacional. Antes de publicar na internet:
- Troque a senha administrativa e a `SECRET_KEY`.
- Desative o modo `--debug`.
- Use HTTPS e variáveis de ambiente seguras na hospedagem.
- Adicione proteção CSRF aos formulários.
- Considere limitar tentativas de login e configurar cookies seguros.
- Não use dados pessoais reais enquanto estiver testando.

## Próximas melhorias recomendadas

- Edição de projetos e tarefas.
- Recuperação de senha.
- Proteção CSRF.
- Paginação e busca.
- Gráficos de indicadores.
- Testes automatizados.
- Publicação com domínio e HTTPS.
