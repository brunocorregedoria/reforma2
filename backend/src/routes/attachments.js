const express = require('express');
const { 
  upload,
  uploadAttachment, 
  getAttachments, 
  getAttachmentById, 
  downloadAttachment,
  deleteAttachment 
} = require('../controllers/attachmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

/**
 * @route POST /api/attachments/upload
 * @desc Upload de arquivo
 * @access Private (admin, gestor, tecnico)
 */
router.post('/upload', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  upload.single('file'),
  logAction('Attachment'),
  uploadAttachment
);

/**
 * @route GET /api/attachments
 * @desc Listar anexos
 * @access Private
 */
router.get('/', authenticateToken, getAttachments);

/**
 * @route GET /api/attachments/:id
 * @desc Obter anexo por ID
 * @access Private
 */
router.get('/:id', authenticateToken, getAttachmentById);

/**
 * @route GET /api/attachments/:id/download
 * @desc Download de arquivo
 * @access Private
 */
router.get('/:id/download', authenticateToken, downloadAttachment);

/**
 * @route DELETE /api/attachments/:id
 * @desc Excluir anexo
 * @access Private (admin, gestor, tecnico)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'gestor', 'tecnico'),
  logAction('Attachment'),
  deleteAttachment
);

module.exports = router;

