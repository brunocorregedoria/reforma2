const express = require('express');
const { 
  createWorkOrder, 
  getWorkOrders, 
  getWorkOrderById, 
  updateWorkOrder, 
  deleteWorkOrder,
  getWorkOrderStats 
} = require('../controllers/workOrderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

/**
 * @route POST /api/work_orders
 * @desc Criar nova ordem de serviço
 * @access Private (admin, gestor, tecnico)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('WorkOrder'),
  createWorkOrder
);

/**
 * @route GET /api/work_orders
 * @desc Listar ordens de serviço
 * @access Private
 */
router.get('/', authenticateToken, getWorkOrders);

/**
 * @route GET /api/work_orders/:id
 * @desc Obter ordem de serviço por ID
 * @access Private
 */
router.get('/:id', authenticateToken, getWorkOrderById);

/**
 * @route PUT /api/work_orders/:id
 * @desc Atualizar ordem de serviço
 * @access Private (admin, gestor, tecnico)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('WorkOrder'),
  updateWorkOrder
);

/**
 * @route DELETE /api/work_orders/:id
 * @desc Excluir ordem de serviço
 * @access Private (admin, gestor)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('WorkOrder'),
  deleteWorkOrder
);

/**
 * @route GET /api/work_orders/:id/stats
 * @desc Obter estatísticas da ordem de serviço
 * @access Private
 */
router.get('/:id/stats', authenticateToken, getWorkOrderStats);

module.exports = router;

