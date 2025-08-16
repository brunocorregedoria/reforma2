const { Vendor } = require('../models');
const { Op } = require('sequelize');

const createVendor = async (req, res) => {
  try {
    const { nome, cpf_cnpj, contato, endereco } = req.body;

    const vendor = await Vendor.create({
      nome,
      cpf_cnpj,
      contato,
      endereco
    });

    res.status(201).json({
      message: 'Fornecedor criado com sucesso',
      vendor
    });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { cpf_cnpj: { [Op.iLike]: `%${search}%` } },
        { contato: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: vendors } = await Vendor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nome', 'ASC']]
    });

    res.json({
      vendors,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, contato, endereco } = req.body;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Salvar valores antigos para o log
    req.oldValue = vendor.toJSON();

    await vendor.update({
      nome,
      cpf_cnpj,
      contato,
      endereco
    });

    res.json({
      message: 'Fornecedor atualizado com sucesso',
      vendor
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    await vendor.destroy();

    res.json({ message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor
};

