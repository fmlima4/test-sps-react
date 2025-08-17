import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserService from "../services/UserService";
import { useAuth } from "../contexts/AuthContext";
import "./Users.css";

const userService = new UserService();

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, user: null });
  const [deleting, setDeleting] = useState(false);
  
  const { logout, user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    const result = await userService.list();
    
    if (result.success) {
      setUsers(result.data.users || []); // garante que users seja sempre array
    } else {
      setError(result.error);
    }
      
    setLoading(false);
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm({ show: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.user) return;

    setDeleting(true);
    const result = await userService.delete(deleteConfirm.user.id);
    
    if (result.success) {
      setUsers(users.filter(u => u.id !== deleteConfirm.user.id));
      setDeleteConfirm({ show: false, user: null });
    } else {
      setError(result.error);
    }
    
    setDeleting(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, user: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header">
        <div className="header-content">
          <h1>Gerenciamento de Usuários</h1>
          <div className="header-actions">
            <span className="user-info">
              Logado como: <strong>{currentUser?.name || 'Usuário'}</strong>
            </span>
            <Link to="/users/new" className="btn btn-primary">
              <span className="btn-icon">+</span>
              Novo Usuário
            </Link>
            <button onClick={logout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Users Table */}
      <div className="users-content">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Nenhum usuário encontrado</h3>
            <p>Comece criando seu primeiro usuário</p>
            <Link to="/users/new" className="btn btn-primary">
              Criar Primeiro Usuário
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td className="user-id">#{user.id}</td>
                    <td className="user-name">
                      <span>{user.name}</span>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-actions">
                      <Link 
                        to={`/users/${user.id}`} 
                        className="action-btn edit-btn"
                        title="Editar usuário"
                      >
                        ✏️
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="action-btn delete-btn"
                        title="Deletar usuário"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir o usuário{' '}
              <strong>{deleteConfirm.user?.name}</strong>?
            </p>
            <p className="warning-text">Esta ação não pode ser desfeita.</p>
            
            <div className="modal-actions">
              <button 
                onClick={handleDeleteCancel}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="users-footer">
        <Link to="/" className="back-link">
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default Users;