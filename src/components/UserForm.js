import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../services/UserService';
import './UserForm.css';

const userService = new UserService();

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEditing = Boolean(userId);

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    setInitialLoading(true);
    const result = await userService.get(userId);
    
    if (result.success) {
      setFormData({
        name: result.data.name || '',
        email: result.data.email || '',
        password: result.data.password || '',
      });
    } else {
      setSubmitError(result.error);
    }
    
    setInitialLoading(false);
  };

  const validateForm = () => {
    const validation = userService.validateUserData(formData, isEditing);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Remove erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpa erro geral
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      let result;
      
      if (isEditing) {
        result = await userService.update(userId, formData);
      } else {
        result = await userService.create(formData);
      }

      if (result.success) {
        navigate('/users', { 
          state: { 
            message: isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!' 
          }
        });
      } else {
        setSubmitError(result.error);
      }
    } catch (error) {
      setSubmitError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (initialLoading) {
    return (
      <div className="user-form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h1>
          <p>
            {isEditing 
              ? 'Atualize as informações do usuário abaixo'
              : 'Preencha os dados para criar um novo usuário'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Nome Completo *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Digite o nome completo"
                autoFocus={!isEditing}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="usuario@exemplo.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
          </div>

          {submitError && (
            <div className="error-banner">
              <span>{submitError}</span>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading 
                ? (isEditing ? 'Salvando...' : 'Criando...') 
                : (isEditing ? 'Salvar Alterações' : 'Criar Usuário')
              }
            </button>
          </div>
        </form>

        <div className="form-footer">
          <small>* Campos obrigatórios</small>
        </div>
      </div>
    </div>
  );
};

export default UserForm;