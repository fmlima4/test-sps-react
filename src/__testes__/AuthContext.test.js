import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock do axios
jest.mock('axios');

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Componente de teste para usar o hook
const TestComponent = () => {
  const { 
    isAuthenticated, 
    user, 
    token, 
    loading, 
    error, 
    login, 
    logout, 
    clearError 
  } = useAuth();

  return (
    <div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      
      <button onClick={() => login('test@example.com', '123456')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    axios.defaults.headers.common = {};
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('deve inicializar com estado padrão', () => {
    renderWithAuthProvider();

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  test('deve restaurar autenticação do localStorage', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'authToken') return mockToken;
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });

    renderWithAuthProvider();

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
  });

  test('deve limpar localStorage se dados corrompidos', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'authUser') return 'invalid-json';
      return null;
    });

    renderWithAuthProvider();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  test('deve fazer login com sucesso', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';

    axios.post.mockResolvedValue({
      data: { user: mockUser, token: mockToken }
    });

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    });

    // Verifica se salvou no localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authUser', JSON.stringify(mockUser));

    // Verifica se configurou o axios
    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
  });

  test('deve exibir loading durante login', async () => {
    axios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    act(() => {
      fireEvent.click(loginButton);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  test('deve tratar erro de login', async () => {
    const errorMessage = 'Credenciais inválidas';
    axios.post.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  test('deve tratar erro genérico de login', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Erro ao fazer login');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  test('deve fazer logout corretamente', async () => {
    // Primeiro faz login
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';

    axios.post.mockResolvedValue({
      data: { user: mockUser, token: mockToken }
    });

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Agora faz logout
    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      fireEvent.click(logoutButton);
    });

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');

    // Verifica se removeu do localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser');

    // Verifica se removeu do axios
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  test('deve limpar erro corretamente', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: 'Erro de teste' } }
    });

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Erro de teste');
    });

    const clearErrorButton = screen.getByText('Clear Error');
    
    act(() => {
      fireEvent.click(clearErrorButton);
    });

    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  test('deve lançar erro se usado fora do Provider', () => {
    // Captura console.error para evitar spam nos testes
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth deve ser usado dentro de um AuthProvider');

    consoleSpy.mockRestore();
  });

  test('deve fazer chamada para endpoint correto', async () => {
    process.env.REACT_APP_SERVER_URL = 'http://localhost:3001';
    
    axios.post.mockResolvedValue({
      data: { user: {}, token: 'token' }
    });

    renderWithAuthProvider();

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      { email: 'test@example.com', password: '123456' }
    );
  });
});