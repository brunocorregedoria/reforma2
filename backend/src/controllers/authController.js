const AuthService = require('../services/AuthService');
const authService = new AuthService();

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      ...result
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    
    res.json({
      message: 'Login realizado com sucesso',
      ...result
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      user
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// Error handling helper
const handleControllerError = (res, error) => {
  console.error('Auth Controller Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      originalError: error.originalError?.message 
    })
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};