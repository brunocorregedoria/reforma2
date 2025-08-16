const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');

    // Sincronizar todas as tabelas
    await sequelize.sync({ force: false });
    console.log('✅ Tabelas criadas/sincronizadas com sucesso.');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('ℹ️  Usuário administrador já existe:', existingAdmin.email);
      return;
    }

    // Criar usuário administrador padrão
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.create({
      nome: 'Administrador do Sistema',
      email: 'admin@reforma.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('👤 Usuário administrador criado com sucesso!');
    console.log('📧 Email: admin@reforma.com');
    console.log('🔑 Senha: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    // Criar alguns dados de exemplo (opcional)
    await createSampleData();

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function createSampleData() {
  try {
    const { Project, Material, WorkOrder } = require('../models');

    // Criar projeto de exemplo
    const sampleProject = await Project.create({
      nome: 'Casa Demo - Reforma Completa',
      endereco: 'Rua das Flores, 123 - Centro',
      descricao: 'Projeto de demonstração do sistema',
      cliente: 'Cliente Exemplo',
      status: 'planejado',
      data_inicio: new Date(),
      data_previsao_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 dias
    });

    // Criar alguns materiais de exemplo
    await Material.bulkCreate([
      {
        nome: 'Cimento CP-II',
        unidade: 'saco',
        custo_unitario: 25.50,
        estoque: 100
      },
      {
        nome: 'Areia Fina',
        unidade: 'm³',
        custo_unitario: 80.00,
        estoque: 50
      },
      {
        nome: 'Tijolo Comum',
        unidade: 'milheiro',
        custo_unitario: 450.00,
        estoque: 20
      },
      {
        nome: 'Tinta Acrílica Branca',
        unidade: 'lata',
        custo_unitario: 85.00,
        estoque: 30
      },
      {
        nome: 'Janela Alumínio 1x1m',
        unidade: 'un',
        custo_unitario: 350.00,
        estoque: 15
      }
    ]);

    // Criar ordem de serviço de exemplo
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    await WorkOrder.create({
      project_id: sampleProject.id,
      titulo: 'Preparação da Obra',
      descricao: 'Limpeza do terreno e preparação inicial',
      tipo_servico: 'preparacao',
      status: 'planejada',
      data_prevista_inicio: new Date(),
      data_prevista_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
      responsavel_id: adminUser.id,
      custo_estimado: 1500.00
    });

    console.log('✅ Dados de exemplo criados com sucesso!');
    
  } catch (error) {
    console.error('⚠️  Erro ao criar dados de exemplo:', error);
    // Não falha o processo principal
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Inicialização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na inicialização:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };