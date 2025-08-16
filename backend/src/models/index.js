const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definição dos modelos
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'gestor', 'tecnico', 'visualizador'),
    defaultValue: 'visualizador'
  }
}, {
  tableName: 'users',
  timestamps: true
});

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT
  },
  descricao: {
    type: DataTypes.TEXT
  },
  cliente: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('planejado', 'em_andamento', 'pausado', 'concluido', 'cancelado'),
    defaultValue: 'planejado'
  },
  data_inicio: {
    type: DataTypes.DATE
  },
  data_previsao_fim: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'projects',
  timestamps: true
});

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'id'
    }
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  tipo_servico: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('planejada', 'em_andamento', 'pausada', 'concluida', 'cancelada'),
    defaultValue: 'planejada'
  },
  data_abertura: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_prevista_inicio: {
    type: DataTypes.DATE
  },
  data_prevista_fim: {
    type: DataTypes.DATE
  },
  responsavel_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  custo_estimado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  custo_real: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'work_orders',
  timestamps: true
});

const Checkpoint = sequelize.define('Checkpoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  work_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: WorkOrder,
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  tipo: {
    type: DataTypes.ENUM('inspecao', 'seguranca', 'qualidade'),
    defaultValue: 'inspecao'
  },
  padrao_json: {
    type: DataTypes.JSON
  },
  concluido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_conclusao: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'checkpoints',
  timestamps: true
});

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unidade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  custo_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  estoque: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'materials',
  timestamps: true
});

const MaterialUsage = sequelize.define('MaterialUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  work_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: WorkOrder,
      key: 'id'
    }
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Material,
      key: 'id'
    }
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  custo_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'material_usages',
  timestamps: true
});

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cpf_cnpj: {
    type: DataTypes.STRING
  },
  contato: {
    type: DataTypes.STRING
  },
  endereco: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'vendors',
  timestamps: true
});

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  work_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: WorkOrder,
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('foto', 'nota', 'perm'),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'attachments',
  timestamps: true
});

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  old_value: {
    type: DataTypes.JSON
  },
  new_value: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'logs',
  timestamps: false
});

// Definição das associações
Project.hasMany(WorkOrder, { foreignKey: 'project_id', as: 'workOrders' });
WorkOrder.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

User.hasMany(WorkOrder, { foreignKey: 'responsavel_id', as: 'workOrders' });
WorkOrder.belongsTo(User, { foreignKey: 'responsavel_id', as: 'responsavel' });

WorkOrder.hasMany(Checkpoint, { foreignKey: 'work_order_id', as: 'checkpoints' });
Checkpoint.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'workOrder' });

WorkOrder.hasMany(MaterialUsage, { foreignKey: 'work_order_id', as: 'materialUsages' });
MaterialUsage.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'workOrder' });

Material.hasMany(MaterialUsage, { foreignKey: 'material_id', as: 'usages' });
MaterialUsage.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

WorkOrder.hasMany(Attachment, { foreignKey: 'work_order_id', as: 'attachments' });
Attachment.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'workOrder' });

User.hasMany(Attachment, { foreignKey: 'uploaded_by', as: 'attachments' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

User.hasMany(Log, { foreignKey: 'user_id', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Project,
  WorkOrder,
  Checkpoint,
  Material,
  MaterialUsage,
  Vendor,
  Attachment,
  Log
};

