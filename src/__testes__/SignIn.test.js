import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../pages/SignIn';

// Mock do contexto de autenticação
const mockLogin = jest.fn();
const mockClearError = jest.fn();

const mockAuthContext = {
  isAuthenticated: false,
  loading: false,
  error: null,
  login: mockLogin,
  clearError: mockClearError
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

const renderSignIn = (locationState = {}) => {
  return render(
    <BrowserRouter>
      <SignIn />
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.loading = false;
    mockAuthContext.error = null;
  });

  test('deve renderizar formulário de login', () => {
    renderSignIn();

    expect(screen.getByRole('heading', { name: /fazer login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('deve mostrar informações de teste', () => {
    renderSignIn();

    expect(screen.getByText('Usuário de teste: admin@spsgroup.com.br')).toBeInTheDocument();
    expect(screen.getByText('Senha de teste: 1234')).toBeInTheDocument();
  });

  test('deve validar campo email obrigatório', async () => {
    renderSignIn();

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('deve validar campo senha obrigatório', async () => {
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('deve validar formato de email', async () => {
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'email-inválido' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('deve validar tamanho mínimo da senha', async () => {
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 4 caracteres')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('deve submeter formulário com dados válidos', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });

  test('deve mostrar loading durante submissão', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Entrando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('deve mostrar erro de login', () => {
    mockAuthContext.error = 'Credenciais inválidas';
    
    renderSignIn();

    expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
  });

  test('deve limpar erro quando campos são alterados', async () => {
    mockAuthContext.error = 'Credenciais inválidas';
    
    renderSignIn();

    expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'novo@email.com' } });

    expect(mockClearError).toHaveBeenCalled();
  });

  test('deve limpar erros de validação quando campos são alterados', async () => {
    renderSignIn();

    // Gera erro de validação
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });

    // Digita no campo email
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Erro deve desaparecer
    expect(screen.queryByText('Email é obrigatório')).not.toBeInTheDocument();
  });

  test('deve focar no campo email após erro de login', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Erro de login' });
    
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Verifica se o email field tem foco (simulação)
    expect(document.activeElement?.id).toBe('email');
  });

  test('deve redirecionar se já autenticado', () => {
    mockAuthContext.isAuthenticated = true;
    
    const { container } = renderSignIn();
    
    // Como estamos mockando o contexto, não podemos testar redirecionamento real
    // mas podemos verificar que o componente não renderiza o formulário
    expect(container.firstChild).toBeNull();
  });

  test('deve ter atributos de acessibilidade corretos', () => {
    renderSignIn();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  test('deve aplicar classes de erro corretamente', async () => {
    renderSignIn();

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveClass('error');
    });
  });
});