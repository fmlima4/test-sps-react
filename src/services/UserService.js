import axios from "axios";

class UserService {
  constructor() {
    this.baseURL = `${process.env.REACT_APP_SERVER_URL}/users`;
  }

  async list() {
    try {
      const response = await axios.get(this.baseURL);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar usuários'
      };
    }
  }

  async get(id) {
    try {
      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const response = await axios.get(`${this.baseURL}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar usuário'
      };
    }
  }

  async create(userData) {
    try {
      // Validações básicas
      if (!userData.name || !userData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      if (!this.isValidEmail(userData.email)) {
        throw new Error('Email inválido');
      }

      const response = await axios.post(this.baseURL, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao criar usuário'
      };
    }
  }

  async update(id, userData) {
    try {
      if (!id) {
        throw new Error('ID é obrigatório');
      }

      // Validações básicas
      if (!userData.name || !userData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      if (!this.isValidEmail(userData.email)) {
        throw new Error('Email inválido');
      }

      const response = await axios.put(`${this.baseURL}/${id}`, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao atualizar usuário'
      };
    }
  }

  async delete(id) {
    try {
      if (!id) {
        throw new Error('ID é obrigatório');
      }

      await axios.delete(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Usuário deletado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar usuário'
      };
    }
  }

  // Método auxiliar para validação de email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método auxiliar para validação de dados do usuário
  validateUserData(userData, isUpdate = false) {
    const errors = {};

    if (!userData.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (userData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!userData.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!this.isValidEmail(userData.email)) {
      errors.email = 'Email inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default UserService;