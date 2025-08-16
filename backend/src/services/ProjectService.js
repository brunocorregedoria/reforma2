const BaseService = require('./BaseService');
const { Project, WorkOrder, User } = require('../models');
const { Op } = require('sequelize');

class ProjectService extends BaseService {
  constructor() {
    super(Project);
  }

  async getAllProjects(options = {}) {
    const { page = 1, limit = 10, status, search } = options;
    
    const where = {};
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    // Search functionality
    if (search) {
      Object.assign(where, this.buildSearchWhere(search, ['nome', 'cliente', 'endereco']));
    }

    const paginationOptions = this.buildPaginationOptions(page, limit);
    
    const queryOptions = {
      where,
      ...paginationOptions,
      include: this.getDefaultIncludes(),
      order: [['createdAt', 'DESC']]
    };

    const data = await this.findAndCountAll(queryOptions);
    return this.formatPaginationResponse(data, page, limit);
  }

  async getProjectById(id) {
    return await this.findByPk(id, {
      include: this.getDefaultIncludes()
    });
  }

  async createProject(projectData) {
    const { nome, endereco, descricao, cliente, data_inicio, data_previsao_fim } = projectData;
    
    return await this.create({
      nome,
      endereco,
      descricao,
      cliente,
      data_inicio,
      data_previsao_fim,
      status: 'planejado'
    });
  }

  async updateProject(id, projectData) {
    const { nome, endereco, descricao, cliente, status, data_inicio, data_previsao_fim } = projectData;
    
    return await this.update(id, {
      nome,
      endereco,
      descricao,
      cliente,
      status,
      data_inicio,
      data_previsao_fim
    });
  }

  async deleteProject(id) {
    // Check if project has associated work orders
    const workOrdersCount = await WorkOrder.count({ where: { project_id: id } });
    
    if (workOrdersCount > 0) {
      const error = new Error('Cannot delete project with associated work orders');
      error.statusCode = 400;
      throw error;
    }

    return await this.delete(id);
  }

  async getProjectStats(id) {
    const project = await this.findByPk(id, {
      include: [{
        model: WorkOrder,
        as: 'workOrders'
      }]
    });

    const stats = {
      total_work_orders: project.workOrders.length,
      work_orders_by_status: {},
      total_custo_estimado: 0,
      total_custo_real: 0
    };

    project.workOrders.forEach(wo => {
      // Count by status
      if (!stats.work_orders_by_status[wo.status]) {
        stats.work_orders_by_status[wo.status] = 0;
      }
      stats.work_orders_by_status[wo.status]++;

      // Sum costs
      stats.total_custo_estimado += parseFloat(wo.custo_estimado || 0);
      stats.total_custo_real += parseFloat(wo.custo_real || 0);
    });

    return stats;
  }

  async getProjectsByStatus() {
    const projects = await this.findAll({
      attributes: ['status'],
      group: ['status'],
      raw: true
    });

    return projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
  }

  getDefaultIncludes() {
    return [
      {
        model: WorkOrder,
        as: 'workOrders',
        attributes: ['id', 'titulo', 'status'],
        include: [
          {
            model: User,
            as: 'responsavel',
            attributes: ['id', 'nome']
          }
        ]
      }
    ];
  }

  validateProjectData(data) {
    const required = ['nome', 'cliente'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Validate dates if provided
    if (data.data_inicio && data.data_previsao_fim) {
      const inicio = new Date(data.data_inicio);
      const fim = new Date(data.data_previsao_fim);
      
      if (fim <= inicio) {
        const error = new Error('End date must be after start date');
        error.statusCode = 400;
        throw error;
      }
    }

    return true;
  }
}

module.exports = ProjectService;