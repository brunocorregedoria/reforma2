const { WorkOrder, Project, User, Checkpoint, MaterialUsage, Material, Attachment } = require('../models');
const { Op } = require('sequelize');

const createWorkOrder = async (req, res) => {
  try {
    const { 
      project_id, 
      titulo, 
      descricao, 
      tipo_servico, 
      data_prevista_inicio, 
      data_prevista_fim, 
      responsavel_id, 
      custo_estimado,
      materiais 
    } = req.body;

    // Verificar se o projeto existe
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar se o responsável existe
    if (responsavel_id) {
      const responsavel = await User.findByPk(responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ error: 'Responsável não encontrado' });
      }
    }

    // Criar a ordem de serviço
    const workOrder = await WorkOrder.create({
      project_id,
      titulo,
      descricao,
      tipo_servico,
      data_prevista_inicio,
      data_prevista_fim,
      responsavel_id,
      custo_estimado: custo_estimado || 0,
      status: 'planejada'
    });

    // Adicionar materiais se fornecidos
    if (materiais && materiais.length > 0) {
      for (const materialData of materiais) {
        const material = await Material.findByPk(materialData.material_id);
        if (material) {
          const custo_total = material.custo_unitario * materialData.quantidade;
          await MaterialUsage.create({
            work_order_id: workOrder.id,
            material_id: materialData.material_id,
            quantidade: materialData.quantidade,
            custo_total
          });
        }
      }
    }

    // Buscar a ordem criada com todas as associações
    const createdWorkOrder = await WorkOrder.findByPk(workOrder.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'nome'] },
        { model: User, as: 'responsavel', attributes: ['id', 'nome'] },
        { 
          model: MaterialUsage, 
          as: 'materialUsages',
          include: [{ model: Material, as: 'material' }]
        }
      ]
    });

    res.status(201).json({
      message: 'Ordem de serviço criada com sucesso',
      workOrder: createdWorkOrder
    });
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getWorkOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, project_id, responsavel_id, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (project_id) {
      where.project_id = project_id;
    }
    if (responsavel_id) {
      where.responsavel_id = responsavel_id;
    }
    if (search) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${search}%` } },
        { descricao: { [Op.iLike]: `%${search}%` } },
        { tipo_servico: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: workOrders } = await WorkOrder.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Project, as: 'project', attributes: ['id', 'nome'] },
        { model: User, as: 'responsavel', attributes: ['id', 'nome'] },
        { model: Checkpoint, as: 'checkpoints' },
        { 
          model: MaterialUsage, 
          as: 'materialUsages',
          include: [{ model: Material, as: 'material' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      workOrders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'responsavel', attributes: ['id', 'nome'] },
        { model: Checkpoint, as: 'checkpoints' },
        { 
          model: MaterialUsage, 
          as: 'materialUsages',
          include: [{ model: Material, as: 'material' }]
        },
        { 
          model: Attachment, 
          as: 'attachments',
          include: [{ model: User, as: 'uploader', attributes: ['id', 'nome'] }]
        }
      ]
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json({ workOrder });
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      titulo, 
      descricao, 
      tipo_servico, 
      status, 
      data_prevista_inicio, 
      data_prevista_fim, 
      responsavel_id, 
      custo_estimado,
      custo_real 
    } = req.body;

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    // Salvar valores antigos para o log
    req.oldValue = workOrder.toJSON();

    // Verificar se o responsável existe (se fornecido)
    if (responsavel_id) {
      const responsavel = await User.findByPk(responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ error: 'Responsável não encontrado' });
      }
    }

    await workOrder.update({
      titulo,
      descricao,
      tipo_servico,
      status,
      data_prevista_inicio,
      data_prevista_fim,
      responsavel_id,
      custo_estimado,
      custo_real
    });

    const updatedWorkOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'nome'] },
        { model: User, as: 'responsavel', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      message: 'Ordem de serviço atualizada com sucesso',
      workOrder: updatedWorkOrder
    });
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    await workOrder.destroy();

    res.json({ message: 'Ordem de serviço excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getWorkOrderStats = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: Checkpoint, as: 'checkpoints' },
        { model: MaterialUsage, as: 'materialUsages' },
        { model: Attachment, as: 'attachments' }
      ]
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const stats = {
      total_checkpoints: workOrder.checkpoints.length,
      checkpoints_concluidos: workOrder.checkpoints.filter(c => c.concluido).length,
      total_materiais: workOrder.materialUsages.length,
      custo_materiais: workOrder.materialUsages.reduce((sum, mu) => sum + parseFloat(mu.custo_total), 0),
      total_anexos: workOrder.attachments.length,
      anexos_por_tipo: {}
    };

    // Contar anexos por tipo
    workOrder.attachments.forEach(att => {
      if (!stats.anexos_por_tipo[att.tipo]) {
        stats.anexos_por_tipo[att.tipo] = 0;
      }
      stats.anexos_por_tipo[att.tipo]++;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas da ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
};

