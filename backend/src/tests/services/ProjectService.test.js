const ProjectService = require('../../services/ProjectService');
const { Project, WorkOrder } = require('../../models');
const { sequelize } = require('../../models');

describe('ProjectService', () => {
  let projectService;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    projectService = new ProjectService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Project.destroy({ where: {} });
    await WorkOrder.destroy({ where: {} });
  });

  describe('createProject', () => {
    it('should create a project with valid data', async () => {
      const projectData = {
        nome: 'Test Project',
        cliente: 'Test Client',
        endereco: 'Test Address',
        descricao: 'Test Description'
      };

      const project = await projectService.createProject(projectData);

      expect(project).toBeDefined();
      expect(project.nome).toBe(projectData.nome);
      expect(project.cliente).toBe(projectData.cliente);
      expect(project.status).toBe('planejado');
    });

    it('should validate required fields', async () => {
      const invalidData = { endereco: 'Test Address' };

      await expect(projectService.validateProjectData(invalidData))
        .rejects.toThrow('Missing required fields');
    });

    it('should validate date logic', async () => {
      const invalidData = {
        nome: 'Test Project',
        cliente: 'Test Client',
        data_inicio: '2025-12-31',
        data_previsao_fim: '2025-01-01'
      };

      await expect(projectService.validateProjectData(invalidData))
        .rejects.toThrow('End date must be after start date');
    });
  });

  describe('getAllProjects', () => {
    beforeEach(async () => {
      await Project.bulkCreate([
        { nome: 'Project 1', cliente: 'Client 1', status: 'planejado' },
        { nome: 'Project 2', cliente: 'Client 2', status: 'em_andamento' },
        { nome: 'Search Project', cliente: 'Client 3', status: 'planejado' }
      ]);
    });

    it('should return paginated projects', async () => {
      const result = await projectService.getAllProjects({ page: 1, limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });

    it('should filter by status', async () => {
      const result = await projectService.getAllProjects({ status: 'planejado' });

      expect(result.items).toHaveLength(2);
      expect(result.items.every(p => p.status === 'planejado')).toBe(true);
    });

    it('should search by name', async () => {
      const result = await projectService.getAllProjects({ search: 'Search' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].nome).toBe('Search Project');
    });
  });

  describe('deleteProject', () => {
    it('should delete project without work orders', async () => {
      const project = await Project.create({
        nome: 'Test Project',
        cliente: 'Test Client'
      });

      const result = await projectService.deleteProject(project.id);

      expect(result.message).toContain('deleted successfully');
      
      const deletedProject = await Project.findByPk(project.id);
      expect(deletedProject).toBeNull();
    });

    it('should not delete project with work orders', async () => {
      const project = await Project.create({
        nome: 'Test Project',
        cliente: 'Test Client'
      });

      await WorkOrder.create({
        project_id: project.id,
        titulo: 'Test Work Order',
        status: 'planejada'
      });

      await expect(projectService.deleteProject(project.id))
        .rejects.toThrow('Cannot delete project with associated work orders');
    });
  });

  describe('getProjectStats', () => {
    it('should calculate project statistics', async () => {
      const project = await Project.create({
        nome: 'Test Project',
        cliente: 'Test Client'
      });

      await WorkOrder.bulkCreate([
        {
          project_id: project.id,
          titulo: 'WO 1',
          status: 'planejada',
          custo_estimado: 1000,
          custo_real: 800
        },
        {
          project_id: project.id,
          titulo: 'WO 2',
          status: 'concluida',
          custo_estimado: 2000,
          custo_real: 1800
        }
      ]);

      const stats = await projectService.getProjectStats(project.id);

      expect(stats.total_work_orders).toBe(2);
      expect(stats.work_orders_by_status.planejada).toBe(1);
      expect(stats.work_orders_by_status.concluida).toBe(1);
      expect(stats.total_custo_estimado).toBe(3000);
      expect(stats.total_custo_real).toBe(2600);
    });
  });
});