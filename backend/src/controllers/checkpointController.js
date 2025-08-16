const { Checkpoint, WorkOrder } = require('../models');

const createCheckpoint = async (req, res) => {
  try {
    const { work_order_id, nome, descricao, ordem, tipo, padrao_json } = req.body;

    // Verificar se a ordem de serviço existe
    const workOrder = await WorkOrder.findByPk(work_order_id);
    if (!workOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const checkpoint = await Checkpoint.create({
      work_order_id,
      nome,
      descricao,
      ordem: ordem || 1,
      tipo: tipo || 'inspecao',
      padrao_json
    });

    res.status(201).json({
      message: 'Checkpoint criado com sucesso',
      checkpoint
    });
  } catch (error) {
    console.error('Erro ao criar checkpoint:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getCheckpoints = async (req, res) => {
  try {
    const { work_order_id, tipo } = req.query;

    const where = {};
    if (work_order_id) {
      where.work_order_id = work_order_id;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    const checkpoints = await Checkpoint.findAll({
      where,
      include: [
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'titulo']
        }
      ],
      order: [['ordem', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json({ checkpoints });
  } catch (error) {
    console.error('Erro ao buscar checkpoints:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getCheckpointById = async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoint = await Checkpoint.findByPk(id, {
      include: [
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'titulo']
        }
      ]
    });

    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint não encontrado' });
    }

    res.json({ checkpoint });
  } catch (error) {
    console.error('Erro ao buscar checkpoint:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateCheckpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ordem, tipo, padrao_json, concluido } = req.body;

    const checkpoint = await Checkpoint.findByPk(id);
    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint não encontrado' });
    }

    // Salvar valores antigos para o log
    req.oldValue = checkpoint.toJSON();

    const updateData = {
      nome,
      descricao,
      ordem,
      tipo,
      padrao_json,
      concluido
    };

    // Se está sendo marcado como concluído, adicionar data de conclusão
    if (concluido && !checkpoint.concluido) {
      updateData.data_conclusao = new Date();
    }
    // Se está sendo desmarcado, remover data de conclusão
    else if (!concluido && checkpoint.concluido) {
      updateData.data_conclusao = null;
    }

    await checkpoint.update(updateData);

    res.json({
      message: 'Checkpoint atualizado com sucesso',
      checkpoint
    });
  } catch (error) {
    console.error('Erro ao atualizar checkpoint:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteCheckpoint = async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoint = await Checkpoint.findByPk(id);
    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint não encontrado' });
    }

    await checkpoint.destroy();

    res.json({ message: 'Checkpoint excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir checkpoint:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const completeCheckpoint = async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoint = await Checkpoint.findByPk(id);
    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint não encontrado' });
    }

    if (checkpoint.concluido) {
      return res.status(400).json({ error: 'Checkpoint já está concluído' });
    }

    await checkpoint.update({
      concluido: true,
      data_conclusao: new Date()
    });

    res.json({
      message: 'Checkpoint marcado como concluído',
      checkpoint
    });
  } catch (error) {
    console.error('Erro ao completar checkpoint:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const createChecklistTemplate = async (req, res) => {
  try {
    const { tipo_servico, checkpoints } = req.body;

    // Criar múltiplos checkpoints para um template
    const createdCheckpoints = [];
    
    for (let i = 0; i < checkpoints.length; i++) {
      const checkpointData = checkpoints[i];
      const checkpoint = await Checkpoint.create({
        work_order_id: null, // Template não tem OS associada
        nome: checkpointData.nome,
        descricao: checkpointData.descricao,
        ordem: i + 1,
        tipo: checkpointData.tipo || 'inspecao',
        padrao_json: {
          template: true,
          tipo_servico,
          ...checkpointData.padrao_json
        }
      });
      createdCheckpoints.push(checkpoint);
    }

    res.status(201).json({
      message: 'Template de checklist criado com sucesso',
      checkpoints: createdCheckpoints
    });
  } catch (error) {
    console.error('Erro ao criar template de checklist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  createCheckpoint,
  getCheckpoints,
  getCheckpointById,
  updateCheckpoint,
  deleteCheckpoint,
  completeCheckpoint,
  createChecklistTemplate
};

