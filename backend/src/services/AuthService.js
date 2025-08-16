const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BaseService = require('./BaseService');
const { User } = require('../models');

class AuthService extends BaseService {
  constructor() {
    super(User);
    this.jwtSecret = process.env.JWT_SECRET || 'reforma_jwt_secret_key_2025';
    this.tokenExpiration = '24h';
  }

  async register(userData) {
    const { nome, email, password, role } = userData;

    // Validate input
    this.validateRegistrationData(userData);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await this.create({
      nome,
      email,
      password: hashedPassword,
      role: role || 'visualizador'
    });

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Validate input
    this.validateLoginData(credentials);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async getProfile(userId) {
    const user = await this.findByPk(userId, {
      attributes: ['id', 'nome', 'email', 'role', 'createdAt']
    });

    return this.sanitizeUser(user);
  }

  async updateProfile(userId, updateData) {
    const { nome, email } = updateData;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [require('sequelize').Op.ne]: userId }
        } 
      });

      if (existingUser) {
        const error = new Error('Email already in use');
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await this.update(userId, { nome, email });
    return this.sanitizeUser(user);
  }

  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    // Validate input
    this.validatePasswordChange(passwordData);

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isValidPassword = await this.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await this.update(userId, { password: hashedPassword });

    return { message: 'Password updated successfully' };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      const user = await this.getProfile(decoded.userId);
      return { valid: true, user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: this.tokenExpiration }
    );
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : user;
    const { password, ...sanitized } = userData;
    return sanitized;
  }

  validateRegistrationData(data) {
    const { nome, email, password } = data;
    const required = ['nome', 'email', 'password'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }

    // Password validation
    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    return true;
  }

  validateLoginData(data) {
    const { email, password } = data;
    const required = ['email', 'password'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    return true;
  }

  validatePasswordChange(data) {
    const { currentPassword, newPassword } = data;
    const required = ['currentPassword', 'newPassword'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    return true;
  }
}

module.exports = AuthService;