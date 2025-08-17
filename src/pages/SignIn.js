import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, error, loading, clearError } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Limpa erros quando o componente é montado
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Limpa erros quando os campos são alterados
    if (error) {
      clearError();
    }
  }, [formData, error, clearError]);

  const validateForm = () => {
    const errors = {};

    // Validação de email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validação de senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 4) {
      errors.password = 'Senha deve ter pelo menos 4 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Remove erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const result = await login(formData.email, formData.password);
    
    setIsSubmitting(false);
    
    // Se o login falhou, o erro já está sendo tratado pelo contexto
    if (!result.success) {
      // Foca no campo de email para nova tentativa
      document.getElementById('email')?.focus();
    }
  };

  // Se já estiver autenticado, redireciona
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>SPS REACT TEST</h1>
          <h2>Fazer Login</h2>
          <p>Entre com suas credenciais para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${formErrors.email ? 'error' : ''}`}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${formErrors.password ? 'error' : ''}`}
              placeholder="Sua senha"
              autoComplete="current-password"
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="signin-button"
          >
            {isSubmitting || loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="signin-footer">
          <p>Usuário de teste: admin@spsgroup.com.br</p>
          <p>Senha de teste: 1234</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;