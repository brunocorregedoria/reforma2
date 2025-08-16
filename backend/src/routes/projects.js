const express = require('express');
const { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  getProjectStats 
} = require('../controllers/projectController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

/**
 * @route POST /api/projects
 * @desc Criar novo projeto
 * @access Private (admin, gestor)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Project'),
  createProject
);

/**
 * @route GET /api/projects
 * @desc Listar projetos
 * @access Private
 */
router.get('/', authenticateToken, getProjects);

/**
 * @route GET /api/projects/:id
 * @desc Obter projeto por ID
 * @access Private
 */
router.get('/:id', authenticateToken, getProjectById);

/**
 * @route PUT /api/projects/:id
 * @desc Atualizar projeto
 * @access Private (admin, gestor)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor'),
  logAction('Project'),
  updateProject
);

/**
 * @route DELETE /api/projects/:id
 * @desc Excluir projeto
 * @access Private (admin)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'),
  logAction('Project'),
  deleteProject
);

/**
 * @route GET /api/projects/:id/stats
 * @desc Obter estatísticas do projeto
 * @access Private
 */
router.get('/:id/stats', authenticateToken, getProjectStats);

module.exports = router;

