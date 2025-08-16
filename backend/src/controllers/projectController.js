const ProjectService = require('../services/ProjectService');
const projectService = new ProjectService();

const createProject = async (req, res) => {
  try {
    // Validate data
    projectService.validateProjectData(req.body);
    
    const project = await projectService.createProject(req.body);
    
    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getProjects = async (req, res) => {
  try {
    const result = await projectService.getAllProjects(req.query);
    res.json(result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ project });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const updateProject = async (req, res) => {
  try {
    // Validate data if provided
    if (Object.keys(req.body).length > 0) {
      projectService.validateProjectData(req.body);
    }
    
    const project = await projectService.updateProject(req.params.id, req.body);
    
    res.json({
      message: 'Projeto atualizado com sucesso',
      project
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const deleteProject = async (req, res) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    res.json(result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getProjectStats = async (req, res) => {
  try {
    const stats = await projectService.getProjectStats(req.params.id);
    res.json({ stats });
  } catch (error) {
    handleControllerError(res, error);
  }
};

// Error handling helper
const handleControllerError = (res, error) => {
  console.error('Controller Error:', error);
  
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
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats
};