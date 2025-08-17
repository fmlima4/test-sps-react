import axios from 'axios';
import UserService from '../services/UserService';

// Mock do axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('UserService', () => {
  let userService;
  const baseURL = 'http://localhost:3001/users';

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    test('deve listar usuários com sucesso', async () => {
      const mockUsers = [
        { id: 1, name: 'João', email: 'joao@test.com' },
        { id: 2, name: 'Maria', email: 'maria@test.com' }
      ];

      axios.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.list();

      expect(axios.get).toHaveBeenCalledWith(baseURL);
      expect(result).toEqual({
        success: true,
        data: mockUsers
      });
    });

    test('deve tratar erro ao listar usuários', async () => {
      const errorMessage = 'Erro no servidor';
      axios.get.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const result = await userService.list();

      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });

    test('deve tratar erro genérico ao listar usuários', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await userService.list();

      expect(result).toEqual({
        success: false,
        error: 'Erro ao listar usuários'
      });
    });
  });

  describe('get', () => {
    test('deve buscar usuário por ID com sucesso', async () => {
      const mockUser = { id: 1, name: 'João', email: 'joao@test.com' };
      axios.get.mockResolvedValue({ data: mockUser });

      const result = await userService.get(1);

      expect(axios.get).toHaveBeenCalledWith(`${baseURL}/1`);
      expect(result).toEqual({
        success: true,
        data: mockUser
      });
    });

    test('deve tratar erro quando ID não fornecido', async () => {
      const result = await userService.get();

      expect(result).toEqual({
        success: false,
        error: 'ID é obrigatório'
      });
    });

    test('deve tratar erro ao buscar usuário', async () => {
      const errorMessage = 'Usuário não encontrado';
      axios.get.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const result = await userService.get(999);

      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });
  });

  describe('create', () => {
    const validUserData = {
      name: 'João Silva',
      email: 'joao@test.com',
    };

    test('deve criar usuário com sucesso', async () => {
      const mockCreatedUser = { id: 1, ...validUserData };
      axios.post.mockResolvedValue({ data: mockCreatedUser });

      const result = await userService.create(validUserData);

      expect(axios.post).toHaveBeenCalledWith(baseURL, validUserData);
      expect(result).toEqual({
        success: true,
        data: mockCreatedUser
      });
    });

    test('deve validar campos obrigatórios', async () => {
      const result = await userService.create({});

      expect(result).toEqual({
        success: false,
        error: 'Nome e email são obrigatórios'
      });
    });

    test('deve validar email inválido', async () => {
      const invalidData = { name: 'João', email: 'email-inválido' };
      
      const result = await userService.create(invalidData);

      expect(result).toEqual({
        success: false,
        error: 'Email inválido'
      });
    });

    test('deve tratar erro do servidor', async () => {
      const errorMessage = 'Email já existe';
      axios.post.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const result = await userService.create(validUserData);

      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });
  });

  describe('update', () => {
    const validUserData = {
      name: 'João Silva Atualizado',
      email: 'joao.novo@test.com'
    };

    test('deve atualizar usuário com sucesso', async () => {
      const mockUpdatedUser = { id: 1, ...validUserData };
      axios.put.mockResolvedValue({ data: mockUpdatedUser });

      const result = await userService.update(1, validUserData);

      expect(axios.put).toHaveBeenCalledWith(`${baseURL}/1`, validUserData);
      expect(result).toEqual({
        success: true,
        data: mockUpdatedUser
      });
    });

    test('deve validar ID obrigatório', async () => {
      const result = await userService.update(null, validUserData);

      expect(result).toEqual({
        success: false,
        error: 'ID é obrigatório'
      });
    });

    test('deve validar dados obrigatórios', async () => {
      const result = await userService.update(1, {});

      expect(result).toEqual({
        success: false,
        error: 'Nome e email são obrigatórios'
      });
    });

    test('deve tratar erro do servidor', async () => {
      const errorMessage = 'Usuário não encontrado';
      axios.put.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const result = await userService.update(999, validUserData);

      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });
  });

  describe('delete', () => {
    test('deve deletar usuário com sucesso', async () => {
      axios.delete.mockResolvedValue({});

      const result = await userService.delete(1);

      expect(axios.delete).toHaveBeenCalledWith(`${baseURL}/1`);
      expect(result).toEqual({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    });

    test('deve validar ID obrigatório', async () => {
      const result = await userService.delete();

      expect(result).toEqual({
        success: false,
        error: 'ID é obrigatório'
      });
    });

    test('deve tratar erro ao deletar', async () => {
      const errorMessage = 'Usuário não pode ser deletado';
      axios.delete.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const result = await userService.delete(1);

      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });
  });

  describe('isValidEmail', () => {
    test('deve validar emails corretos', () => {
      expect(userService.isValidEmail('test@example.com')).toBe(true);
      expect(userService.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(userService.isValidEmail('user+tag@example.org')).toBe(true);
    });

    test('deve invalidar emails incorretos', () => {
      expect(userService.isValidEmail('email-inválido')).toBe(false);
      expect(userService.isValidEmail('email@')).toBe(false);
      expect(userService.isValidEmail('@domain.com')).toBe(false);
      expect(userService.isValidEmail('')).toBe(false);
      expect(userService.isValidEmail(null)).toBe(false);
      expect(userService.isValidEmail(undefined)).toBe(false);
    });
  });

  describe('validateUserData', () => {
    test('deve validar dados válidos', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao@test.com',
      };

      const result = userService.validateUserData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('deve detectar nome obrigatório', () => {
      const invalidData = { email: 'joao@test.com' };

      const result = userService.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome é obrigatório');
    });

    test('deve detectar nome muito curto', () => {
      const invalidData = { name: 'J', email: 'joao@test.com' };

      const result = userService.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    test('deve detectar email obrigatório', () => {
      const invalidData = { name: 'João Silva' };

      const result = userService.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email é obrigatório');
    });

    test('deve detectar email inválido', () => {
      const invalidData = { name: 'João Silva', email: 'email-inválido' };

      const result = userService.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email inválido');
    });

    test('deve validar múltiplos erros', () => {
      const invalidData = {
        name: '',
        email: 'email-inválido',
      };

      const result = userService.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome é obrigatório');
      expect(result.errors.email).toBe('Email inválido');
    });
  });
});