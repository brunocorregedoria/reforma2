const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

describe('Projects Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Sincronizar banco de dados para testes
    await sequelize.sync({ force: true });

    // Criar usuário admin para testes
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        password: '123456',
        role: 'admin'
      });

    token = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        nome: 'Projeto Teste',
        endereco: 'Rua Teste, 123',
        descricao: 'Descrição do projeto teste',
        cliente: 'Cliente Teste',
        data_inicio: '2025-01-01',
        data_previsao_fim: '2025-06-01'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('project');
      expect(response.body.project.nome).toBe(projectData.nome);
      expect(response.body.project.status).toBe('planejado');
    });

    it('should not create project without authentication', async () => {
      const projectData = {
        nome: 'Projeto Sem Auth',
        cliente: 'Cliente Teste'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/projects', () => {
    it('should get projects list', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.projects)).toBe(true);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=planejado')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      response.body.projects.forEach(project => {
        expect(project.status).toBe('planejado');
      });
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId;

    beforeAll(async () => {
      // Criar um projeto para testar
      const projectResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Projeto para Busca',
          cliente: 'Cliente Busca'
        });
      
      projectId = projectResponse.body.project.id;
    });

    it('should get project by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('project');
      expect(response.body.project.id).toBe(projectId);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});

