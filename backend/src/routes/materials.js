const express = require('express');
const { 
  createMaterial, 
  getMaterials, 
  getMaterialById, 
  updateMaterial, 
  deleteMaterial,
  updateStock 
} = require('../controllers/materialController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

/**
 * @route POST /api/materials
 * @desc Criar novo material
 * @access Private (admin, gestor, tecnico)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Material'),
  createMaterial
);

/**
 * @route GET /api/materials
 * @desc Listar materiais
 * @access Private (admin, gestor, tecnico)
 */
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  getMaterials
);

/**
 * @route GET /api/materials/:id
 * @desc Obter material por ID
 * @access Private (admin, gestor, tecnico)
 */
router.get('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  getMaterialById
);

/**
 * @route PUT /api/materials/:id
 * @desc Atualizar material
 * @access Private (admin, gestor, tecnico)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Material'),
  updateMaterial
);

/**
 * @route DELETE /api/materials/:id
 * @desc Excluir material
 * @access Private (admin, gestor)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Material'),
  deleteMaterial
);

/**
 * @route PATCH /api/materials/:id/stock
 * @desc Atualizar estoque do material
 * @access Private (admin, gestor, tecnico)
 */
router.patch('/:id/stock', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Material'),
  updateStock
);

module.exports = router;

