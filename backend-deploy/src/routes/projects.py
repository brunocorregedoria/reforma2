from flask import Blueprint, request, jsonify
from src.models.models import db, Project, WorkOrder
from src.routes.auth import token_required
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['POST'])
@token_required
def create_project(current_user):
    try:
        data = request.get_json()
        
        if not data or not data.get('nome'):
            return jsonify({'error': 'Nome do projeto é obrigatório'}), 400
        
        project = Project(
            nome=data['nome'],
            endereco=data.get('endereco'),
            descricao=data.get('descricao'),
            cliente=data.get('cliente'),
            data_inicio=datetime.strptime(data['data_inicio'], '%Y-%m-%d').date() if data.get('data_inicio') else None,
            data_previsao_fim=datetime.strptime(data['data_previsao_fim'], '%Y-%m-%d').date() if data.get('data_previsao_fim') else None
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'message': 'Projeto criado com sucesso',
            'project': project.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('', methods=['GET'])
@token_required
def get_projects(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status')
        search = request.args.get('search')
        
        query = Project.query
        
        if status:
            query = query.filter(Project.status == status)
        
        if search:
            query = query.filter(
                db.or_(
                    Project.nome.ilike(f'%{search}%'),
                    Project.cliente.ilike(f'%{search}%'),
                    Project.endereco.ilike(f'%{search}%')
                )
            )
        
        projects = query.paginate(
            page=page, 
            per_page=limit, 
            error_out=False
        )
        
        return jsonify({
            'projects': [project.to_dict() for project in projects.items],
            'pagination': {
                'total': projects.total,
                'page': page,
                'limit': limit,
                'pages': projects.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/<int:project_id>', methods=['GET'])
@token_required
def get_project(current_user, project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Projeto não encontrado'}), 404
        
        return jsonify({'project': project.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@token_required
def update_project(current_user, project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Projeto não encontrado'}), 404
        
        data = request.get_json()
        
        if data.get('nome'):
            project.nome = data['nome']
        if data.get('endereco'):
            project.endereco = data['endereco']
        if data.get('descricao'):
            project.descricao = data['descricao']
        if data.get('cliente'):
            project.cliente = data['cliente']
        if data.get('status'):
            project.status = data['status']
        if data.get('data_inicio'):
            project.data_inicio = datetime.strptime(data['data_inicio'], '%Y-%m-%d').date()
        if data.get('data_previsao_fim'):
            project.data_previsao_fim = datetime.strptime(data['data_previsao_fim'], '%Y-%m-%d').date()
        
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Projeto atualizado com sucesso',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@token_required
def delete_project(current_user, project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Projeto não encontrado'}), 404
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': 'Projeto excluído com sucesso'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/<int:project_id>/stats', methods=['GET'])
@token_required
def get_project_stats(current_user, project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Projeto não encontrado'}), 404
        
        work_orders = WorkOrder.query.filter_by(project_id=project_id).all()
        
        stats = {
            'total_work_orders': len(work_orders),
            'work_orders_by_status': {},
            'total_custo_estimado': 0.00,
            'total_custo_real': 0.00
        }
        
        for wo in work_orders:
            status = wo.status
            if status not in stats['work_orders_by_status']:
                stats['work_orders_by_status'][status] = 0
            stats['work_orders_by_status'][status] += 1
            
            stats['total_custo_estimado'] += float(wo.custo_estimado) if wo.custo_estimado else 0.00
            stats['total_custo_real'] += float(wo.custo_real) if wo.custo_real else 0.00
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

