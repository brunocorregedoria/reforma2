const express = require('express');
const { 
  createVendor, 
  getVendors, 
  getVendorById, 
  updateVendor, 
  deleteVendor 
} = require('../controllers/vendorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

/**
 * @route POST /api/vendors
 * @desc Criar novo fornecedor
 * @access Private (admin, gestor)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Vendor'),
  createVendor
);

/**
 * @route GET /api/vendors
 * @desc Listar fornecedores
 * @access Private (admin, gestor)
 */
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  getVendors
);

/**
 * @route GET /api/vendors/:id
 * @desc Obter fornecedor por ID
 * @access Private (admin, gestor)
 */
router.get('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  getVendorById
);

/**
 * @route PUT /api/vendors/:id
 * @desc Atualizar fornecedor
 * @access Private (admin, gestor)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Vendor'),
  updateVendor
);

/**
 * @route DELETE /api/vendors/:id
 * @desc Excluir fornecedor
 * @access Private (admin)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'),
  logAction('Vendor'),
  deleteVendor
);

module.exports = router;

