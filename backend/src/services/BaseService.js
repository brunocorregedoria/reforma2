const { Op } = require('sequelize');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findByPk(id, options = {}) {
    try {
      const result = await this.model.findByPk(id, options);
      if (!result) {
        throw new Error(`${this.model.name} not found with id: ${id}`);
      }
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, data) {
    try {
      const instance = await this.findByPk(id);
      return await instance.update(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id) {
    try {
      const instance = await this.findByPk(id);
      await instance.destroy();
      return { message: `${this.model.name} deleted successfully` };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAndCountAll(options = {}) {
    try {
      return await this.model.findAndCountAll(options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  buildPaginationOptions(page = 1, limit = 10) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    return {
      limit: parseInt(limit),
      offset: Math.max(0, offset)
    };
  }

  buildSearchWhere(searchTerm, searchFields = []) {
    if (!searchTerm || !searchFields.length) return {};
    
    return {
      [Op.or]: searchFields.map(field => ({
        [field]: { [Op.iLike]: `%${searchTerm}%` }
      }))
    };
  }

  formatPaginationResponse(data, page, limit) {
    const { count, rows } = data;
    return {
      items: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  }

  handleError(error) {
    console.error(`${this.constructor.name} Error:`, error);
    
    // Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      const customError = new Error(`Validation error: ${validationErrors.join(', ')}`);
      customError.statusCode = 400;
      return customError;
    }

    // Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const customError = new Error(`${field} already exists`);
      customError.statusCode = 400;
      return customError;
    }

    // Foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const customError = new Error('Invalid reference to related resource');
      customError.statusCode = 400;
      return customError;
    }

    // Custom errors with status codes
    if (error.statusCode) {
      return error;
    }

    // Generic error
    const customError = new Error('Internal server error');
    customError.statusCode = 500;
    customError.originalError = error;
    return customError;
  }
}

module.exports = BaseService;