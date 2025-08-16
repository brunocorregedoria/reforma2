const { Attachment, WorkOrder, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const exifr = require('exifr');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const uploadAttachment = async (req, res) => {
  try {
    const { work_order_id, tipo } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    // Verificar se a ordem de serviço existe
    const workOrder = await WorkOrder.findByPk(work_order_id);
    if (!workOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    let metadata = {};
    
    // Extrair metadados EXIF para imagens
    if (req.file.mimetype.startsWith('image/')) {
      try {
        const exifData = await exifr.parse(req.file.path);
        if (exifData) {
          metadata = {
            exif: {
              dateTime: exifData.DateTime,
              gps: exifData.latitude && exifData.longitude ? {
                latitude: exifData.latitude,
                longitude: exifData.longitude
              } : null,
              camera: exifData.Make && exifData.Model ? {
                make: exifData.Make,
                model: exifData.Model
              } : null,
              dimensions: {
                width: exifData.ExifImageWidth || exifData.ImageWidth,
                height: exifData.ExifImageHeight || exifData.ImageHeight
              }
            }
          };
        }
      } catch (exifError) {
        console.warn('Erro ao extrair EXIF:', exifError.message);
      }
    }

    // Adicionar informações do arquivo
    metadata.file = {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date()
    };

    const attachment = await Attachment.create({
      work_order_id,
      tipo: tipo || 'foto',
      file_path: req.file.path,
      uploaded_by: req.user.id,
      metadata
    });

    const attachmentWithDetails = await Attachment.findByPk(attachment.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'nome']
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'titulo']
        }
      ]
    });

    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      attachment: attachmentWithDetails
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getAttachments = async (req, res) => {
  try {
    const { work_order_id, tipo } = req.query;

    const where = {};
    if (work_order_id) {
      where.work_order_id = work_order_id;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    const attachments = await Attachment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'nome']
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'titulo']
        }
      ],
      order: [['uploaded_at', 'DESC']]
    });

    res.json({ attachments });
  } catch (error) {
    console.error('Erro ao buscar anexos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'nome']
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'titulo']
        }
      ]
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    res.json({ attachment });
  } catch (error) {
    console.error('Erro ao buscar anexo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    // Verificar se o arquivo existe
    try {
      await fs.access(attachment.file_path);
    } catch (error) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    const fileName = attachment.metadata?.file?.originalName || path.basename(attachment.file_path);
    
    res.download(attachment.file_path, fileName, (error) => {
      if (error) {
        console.error('Erro no download:', error);
        res.status(500).json({ error: 'Erro ao baixar arquivo' });
      }
    });
  } catch (error) {
    console.error('Erro ao baixar anexo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    // Remover arquivo do sistema de arquivos
    try {
      await fs.unlink(attachment.file_path);
    } catch (error) {
      console.warn('Arquivo já foi removido do sistema:', error.message);
    }

    await attachment.destroy();

    res.json({ message: 'Anexo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir anexo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  upload,
  uploadAttachment,
  getAttachments,
  getAttachmentById,
  downloadAttachment,
  deleteAttachment
};

