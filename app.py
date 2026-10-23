import os
from datetime import datetime
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "troque-esta-chave-em-producao")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:sua_senha@localhost/portfolio_gestao?charset=utf8mb4"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    technologies = db.Column(db.String(250), nullable=False, default="")
    link = db.Column(db.String(300), nullable=True)
    featured = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, default="")
    priority = db.Column(db.String(20), default="Média", nullable=False)
    status = db.Column(db.String(30), default="Pendente", nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("logged_in"):
            flash("Entre na área administrativa para continuar.", "warning")
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


@app.route("/")
def index():
    projects = Project.query.order_by(Project.featured.desc(), Project.created_at.desc()).all()
    return render_template("index.html", projects=projects)


@app.route("/sobre")
def sobre():
    return render_template("sobre.html")


@app.route("/contato")
def contato():
    return render_template("contato.html")


@app.route("/admin/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = os.getenv("ADMIN_USERNAME", "admin")
        password_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
        entered_user = request.form.get("username", "")
        entered_password = request.form.get("password", "")
        # Para facilitar o primeiro uso local, aceita ADMIN_PASSWORD no .env.
        local_password = os.getenv("ADMIN_PASSWORD", "mudar123")
        valid_password = (
            check_password_hash(password_hash, entered_password)
            if password_hash else entered_password == local_password
        )
        if entered_user == username and valid_password:
            session.clear()
            session["logged_in"] = True
            flash("Login realizado com sucesso.", "success")
            return redirect(url_for("dashboard"))
        flash("Usuário ou senha incorretos.", "danger")
    return render_template("login.html")


@app.route("/admin/logout")
def logout():
    session.clear()
    flash("Você saiu da área administrativa.", "info")
    return redirect(url_for("index"))


@app.route("/admin")
@login_required
def dashboard():
    total_projects = Project.query.count()
    total_tasks = Task.query.count()
    pending_tasks = Task.query.filter_by(status="Pendente").count()
    completed_tasks = Task.query.filter_by(status="Concluída").count()
    recent_tasks = Task.query.order_by(Task.created_at.desc()).limit(5).all()
    return render_template(
        "dashboard.html",
        total_projects=total_projects,
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        completed_tasks=completed_tasks,
        recent_tasks=recent_tasks
    )


@app.route("/admin/projetos", methods=["GET", "POST"])
@login_required
def manage_projects():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        technologies = request.form.get("technologies", "").strip()
        link = request.form.get("link", "").strip()
        if not title or not description:
            flash("Título e descrição são obrigatórios.", "danger")
        else:
            project = Project(
                title=title,
                description=description,
                technologies=technologies,
                link=link or None,
                featured=bool(request.form.get("featured"))
            )
            db.session.add(project)
            db.session.commit()
            flash("Projeto adicionado ao portfólio.", "success")
            return redirect(url_for("manage_projects"))
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return render_template("admin_projects.html", projects=projects)


@app.route("/admin/projetos/<int:project_id>/excluir", methods=["POST"])
@login_required
def delete_project(project_id):
    project = db.get_or_404(Project, project_id)
    db.session.delete(project)
    db.session.commit()
    flash("Projeto excluído.", "info")
    return redirect(url_for("manage_projects"))


@app.route("/admin/tarefas", methods=["GET", "POST"])
@login_required
def manage_tasks():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        priority = request.form.get("priority", "Média")
        status = request.form.get("status", "Pendente")
        due_date_text = request.form.get("due_date", "").strip()
        if not title:
            flash("O título da tarefa é obrigatório.", "danger")
        elif priority not in {"Baixa", "Média", "Alta"} or status not in {"Pendente", "Em andamento", "Concluída"}:
            flash("Prioridade ou status inválido.", "danger")
        else:
            try:
                due_date = datetime.strptime(due_date_text, "%Y-%m-%d").date() if due_date_text else None
            except ValueError:
                due_date = None
            task = Task(title=title, description=description, priority=priority, status=status, due_date=due_date)
            db.session.add(task)
            db.session.commit()
            flash("Tarefa cadastrada.", "success")
            return redirect(url_for("manage_tasks"))
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return render_template("admin_tasks.html", tasks=tasks)


@app.route("/admin/tarefas/<int:task_id>/status", methods=["POST"])
@login_required
def update_task_status(task_id):
    task = db.get_or_404(Task, task_id)
    status = request.form.get("status", "")
    if status in {"Pendente", "Em andamento", "Concluída"}:
        task.status = status
        db.session.commit()
        flash("Status atualizado.", "success")
    else:
        flash("Status inválido.", "danger")
    return redirect(url_for("manage_tasks"))


@app.route("/admin/tarefas/<int:task_id>/excluir", methods=["POST"])
@login_required
def delete_task(task_id):
    task = db.get_or_404(Task, task_id)
    db.session.delete(task)
    db.session.commit()
    flash("Tarefa excluída.", "info")
    return redirect(url_for("manage_tasks"))


@app.cli.command("init-db")
def init_db():
    """Cria as tabelas do banco de dados."""
    with app.app_context():
        db.create_all()
        print("Tabelas criadas com sucesso.")


@app.cli.command("seed")
def seed():
    """Adiciona projetos de demonstração se o banco estiver vazio."""
    with app.app_context():
        db.create_all()
        if Project.query.count() == 0:
            examples = [
                Project(
                    title="Dashboard de indicadores",
                    description="Painel para acompanhar indicadores e transformar dados em informações úteis para decisões.",
                    technologies="Python, Flask, MySQL, HTML, CSS, JavaScript",
                    featured=True
                ),
                Project(
                    title="Organização de dados com SQL",
                    description="Projeto de prática com modelagem relacional, consultas e relacionamentos entre tabelas.",
                    technologies="MySQL, SQL",
                    featured=False
                ),
                Project(
                    title="Automação de planilhas",
                    description="Exemplo de projeto para demonstrar organização de dados, fórmulas e automação de processos.",
                    technologies="Excel, Python",
                    featured=False
                ),
            ]
            db.session.add_all(examples)
            db.session.commit()
            print("Projetos de demonstração adicionados.")
        else:
            print("Já existem projetos cadastrados; nenhuma alteração feita.")


if __name__ == "__main__":
    app.run(debug=True)
