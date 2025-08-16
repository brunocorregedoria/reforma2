const express = require('express');
const { 
  createCheckpoint, 
  getCheckpoints, 
  getCheckpointById, 
  updateCheckpoint, 
  deleteCheckpoint,
  completeCheckpoint,
  createChecklistTemplate 
} = require('../controllers/checkpointController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

/**
 * @route POST /api/checkpoints
 * @desc Criar novo checkpoint
 * @access Private (admin, gestor, tecnico)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Checkpoint'),
  createCheckpoint
);

/**
 * @route GET /api/checkpoints
 * @desc Listar checkpoints
 * @access Private
 */
router.get('/', authenticateToken, getCheckpoints);

/**
 * @route GET /api/checkpoints/:id
 * @desc Obter checkpoint por ID
 * @access Private
 */
router.get('/:id', authenticateToken, getCheckpointById);

/**
 * @route PUT /api/checkpoints/:id
 * @desc Atualizar checkpoint
 * @access Private (admin, gestor, tecnico)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Checkpoint'),
  updateCheckpoint
);

/**
 * @route DELETE /api/checkpoints/:id
 * @desc Excluir checkpoint
 * @access Private (admin, gestor)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Checkpoint'),
  deleteCheckpoint
);

/**
 * @route PATCH /api/checkpoints/:id/complete
 * @desc Marcar checkpoint como concluído
 * @access Private (admin, gestor, tecnico)
 */
router.patch('/:id/complete', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Checkpoint'),
  completeCheckpoint
);

/**
 * @route POST /api/checkpoints/templates
 * @desc Criar template de checklist
 * @access Private (admin, gestor)
 */
router.post('/templates', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Checkpoint'),
  createChecklistTemplate
);

module.exports = router;

