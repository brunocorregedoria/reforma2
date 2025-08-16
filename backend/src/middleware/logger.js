const { Log } = require('../models');

const logAction = (entity) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log apenas operações bem-sucedidas (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action = getActionFromMethod(req.method);
        const entityId = req.params.id || (data && JSON.parse(data).id);
        
        if (entityId && req.user) {
          Log.create({
            entity: entity,
            entity_id: entityId,
            action: action,
            user_id: req.user.id,
            old_value: req.oldValue || null,
            new_value: req.body || null
          }).catch(err => console.error('Erro ao criar log:', err));
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

const getActionFromMethod = (method) => {
  const actions = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
    'GET': 'READ'
  };
  return actions[method] || 'UNKNOWN';
};

module.exports = {
  logAction
};

