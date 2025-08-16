const { Material, MaterialUsage, WorkOrder } = require('../models');
const { Op } = require('sequelize');

const createMaterial = async (req, res) => {
  try {
    const { nome, unidade, custo_unitario, estoque } = req.body;

    const material = await Material.create({
      nome,
      unidade,
      custo_unitario: custo_unitario || 0,
      estoque: estoque || 0
    });

    res.status(201).json({
      message: 'Material criado com sucesso',
      material
    });
  } catch (error) {
    console.error('Erro ao criar material:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { unidade: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: materials } = await Material.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nome', 'ASC']]
    });

    res.json({
      materials,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id, {
      include: [
        {
          model: MaterialUsage,
          as: 'usages',
          include: [
            {
              model: WorkOrder,
              as: 'workOrder',
              attributes: ['id', 'titulo']
            }
          ]
        }
      ]
    });

    if (!material) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    res.json({ material });
  } catch (error) {
    console.error('Erro ao buscar material:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, unidade, custo_unitario, estoque } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    // Salvar valores antigos para o log
    req.oldValue = material.toJSON();

    await material.update({
      nome,
      unidade,
      custo_unitario,
      estoque
    });

    res.json({
      message: 'Material atualizado com sucesso',
      material
    });
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    // Verificar se há uso do material
    const usageCount = await MaterialUsage.count({ where: { material_id: id } });
    if (usageCount > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir material que já foi utilizado' 
      });
    }

    await material.destroy();

    res.json({ message: 'Material excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir material:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, operacao } = req.body; // operacao: 'add' ou 'subtract'

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    let novoEstoque = material.estoque;
    if (operacao === 'add') {
      novoEstoque += parseInt(quantidade);
    } else if (operacao === 'subtract') {
      novoEstoque -= parseInt(quantidade);
      if (novoEstoque < 0) {
        return res.status(400).json({ error: 'Estoque não pode ficar negativo' });
      }
    }

    await material.update({ estoque: novoEstoque });

    res.json({
      message: 'Estoque atualizado com sucesso',
      material
    });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  updateStock
};

