from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'gestor', 'tecnico', 'visualizador', name='user_roles'), default='visualizador')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    endereco = db.Column(db.Text)
    descricao = db.Column(db.Text)
    cliente = db.Column(db.String(255))
    status = db.Column(db.Enum('planejado', 'em_andamento', 'pausado', 'concluido', 'cancelado', name='project_status'), default='planejado')
    data_inicio = db.Column(db.Date)
    data_previsao_fim = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'endereco': self.endereco,
            'descricao': self.descricao,
            'cliente': self.cliente,
            'status': self.status,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_previsao_fim': self.data_previsao_fim.isoformat() if self.data_previsao_fim else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class WorkOrder(db.Model):
    __tablename__ = 'work_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    titulo = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    tipo_servico = db.Column(db.String(255))
    status = db.Column(db.Enum('planejada', 'em_andamento', 'pausada', 'concluida', 'cancelada', name='work_order_status'), default='planejada')
    data_abertura = db.Column(db.Date, default=datetime.utcnow)
    data_prevista_inicio = db.Column(db.Date)
    data_prevista_fim = db.Column(db.Date)
    responsavel_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    custo_estimado = db.Column(db.Numeric(10, 2), default=0.00)
    custo_real = db.Column(db.Numeric(10, 2), default=0.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', backref='work_orders')
    responsavel = db.relationship('User', backref='work_orders')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'tipo_servico': self.tipo_servico,
            'status': self.status,
            'data_abertura': self.data_abertura.isoformat() if self.data_abertura else None,
            'data_prevista_inicio': self.data_prevista_inicio.isoformat() if self.data_prevista_inicio else None,
            'data_prevista_fim': self.data_prevista_fim.isoformat() if self.data_prevista_fim else None,
            'responsavel_id': self.responsavel_id,
            'custo_estimado': float(self.custo_estimado) if self.custo_estimado else 0.00,
            'custo_real': float(self.custo_real) if self.custo_real else 0.00,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

