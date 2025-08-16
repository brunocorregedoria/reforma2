// Setup global para testes
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'reforma_residencial_test';
process.env.DB_USER = 'reforma_user';
process.env.DB_PASSWORD = 'reforma_pass123';
process.env.JWT_SECRET = 'test_jwt_secret';

// Configurar timeout para operações assíncronas
jest.setTimeout(30000);

