const { Project, WorkOrder, User } = require('../models');
const { Op } = require('sequelize');

const createProject = async (req, res) => {
  try {
    const { nome, endereco, descricao, cliente, data_inicio, data_previsao_fim } = req.body;

    const project = await Project.create({
      nome,
      endereco,
      descricao,
      cliente,
      data_inicio,
      data_previsao_fim,
      status: 'planejado'
    });

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { cliente: { [Op.iLike]: `%${search}%` } },
        { endereco: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
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
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      projects,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: WorkOrder,
          as: 'workOrders',
          include: [
            {
              model: User,
              as: 'responsavel',
              attributes: ['id', 'nome']
            }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, descricao, cliente, status, data_inicio, data_previsao_fim } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Salvar valores antigos para o log
    req.oldValue = project.toJSON();

    await project.update({
      nome,
      endereco,
      descricao,
      cliente,
      status,
      data_inicio,
      data_previsao_fim
    });

    res.json({
      message: 'Projeto atualizado com sucesso',
      project
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar se há ordens de serviço associadas
    const workOrdersCount = await WorkOrder.count({ where: { project_id: id } });
    if (workOrdersCount > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir projeto com ordens de serviço associadas' 
      });
    }

    await project.destroy();

    res.json({ message: 'Projeto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: WorkOrder,
          as: 'workOrders'
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const stats = {
      total_work_orders: project.workOrders.length,
      work_orders_by_status: {},
      total_custo_estimado: 0,
      total_custo_real: 0
    };

    project.workOrders.forEach(wo => {
      // Contar por status
      if (!stats.work_orders_by_status[wo.status]) {
        stats.work_orders_by_status[wo.status] = 0;
      }
      stats.work_orders_by_status[wo.status]++;

      // Somar custos
      stats.total_custo_estimado += parseFloat(wo.custo_estimado || 0);
      stats.total_custo_real += parseFloat(wo.custo_real || 0);
    });

    res.json({ stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats
};

