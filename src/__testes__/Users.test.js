import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Users from '../pages/Users';
import UserService from '../services/UserService';

// Mock do serviço de usuários
jest.mock('../services/UserService');

// Mock do contexto de autenticação
const mockAuthContext = {
  isAuthenticated: true,
  user: { name: 'Test User', email: 'test@example.com' },
  logout: jest.fn()
};

jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => mockAuthContext
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Users Component', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
    }
  ];

  beforeEach(() => {
    // Reset dos mocks antes de cada teste
    UserService.prototype.list = jest.fn();
    UserService.prototype.delete = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar o loading inicialmente', () => {
    UserService.prototype.list.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<Users />);

    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });

  test('deve renderizar a lista de usuários corretamente', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('joao@example.com')).toBeInTheDocument();
      expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem quando não há usuários', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: []
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
      expect(screen.getByText('Comece criando seu primeiro usuário')).toBeInTheDocument();
    });
  });

  test('deve exibir erro quando falha ao carregar usuários', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: false,
      error: 'Erro ao carregar usuários'
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar usuários')).toBeInTheDocument();
    });
  });

  test('deve abrir modal de confirmação ao clicar em deletar', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Clica no botão de deletar do primeiro usuário
    const deleteButtons = screen.getAllByTitle('Deletar usuário');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja excluir o usuário/)).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('deve cancelar a exclusão corretamente', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Abre modal de confirmação
    const deleteButtons = screen.getAllByTitle('Deletar usuário');
    fireEvent.click(deleteButtons[0]);

    // Clica em cancelar
    fireEvent.click(screen.getByText('Cancelar'));

    // Modal deve fechar
    expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
  });

  test('deve deletar usuário com sucesso', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    UserService.prototype.delete.mockResolvedValue({
      success: true
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Abre modal de confirmação
    const deleteButtons = screen.getAllByTitle('Deletar usuário');
    fireEvent.click(deleteButtons[0]);

    // Confirma exclusão
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(UserService.prototype.delete).toHaveBeenCalledWith(1);
      // Modal deve fechar
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    });
  });

  test('deve exibir erro ao falhar na exclusão', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    UserService.prototype.delete.mockResolvedValue({
      success: false,
      error: 'Erro ao excluir usuário'
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Abre modal de confirmação
    const deleteButtons = screen.getAllByTitle('Deletar usuário');
    fireEvent.click(deleteButtons[0]);

    // Confirma exclusão
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao excluir usuário')).toBeInTheDocument();
    });
  });

  test('deve chamar logout ao clicar no botão sair', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  test('deve exibir informações do usuário logado', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText(/Logado como:/)).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  test('deve formatar datas corretamente', async () => {
    UserService.prototype.list.mockResolvedValue({
      success: true,
      data: mockUsers
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      // Verifica se as datas estão formatadas no padrão brasileiro
      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
      expect(screen.getByText('02/01/2024')).toBeInTheDocument();
    });
  });
});