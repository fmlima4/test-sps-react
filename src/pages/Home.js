import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <div className="header-brand">
            <h1>SPS REACT TEST</h1>
            <p>Sistema de Gerenciamento de Usuários</p>
          </div>
          
          {isAuthenticated && (
            <div className="header-user">
              <span className="welcome-text">
                Bem-vindo, <strong>{user?.name || 'Usuário'}</strong>
              </span>
              <button onClick={logout} className="btn btn-outline">
                Sair
              </button>
            </div>
          )}
        </header>

        <main className="home-main">
          {!isAuthenticated ? (
            <div className="auth-section">
              <div className="auth-card">
                <div className="auth-icon">🔐</div>
                <h2>Acesso Restrito</h2>
                <p>
                  Você precisa estar autenticado para acessar o sistema de gerenciamento de usuários.
                </p>
                <Link to="/signin" className="btn btn-primary btn-large">
                  Fazer Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="dashboard-section">
              <div className="features-grid">
                <Link to="/users" className="feature-card">
                  <div className="feature-icon">👥</div>
                  <h3>Gerenciar Usuários</h3>
                  <p>Visualize, edite e exclua usuários do sistema</p>
                  <div className="feature-arrow">→</div>
                </Link>

                <Link to="/users/new" className="feature-card">
                  <div className="feature-icon">➕</div>
                  <h3>Novo Usuário</h3>
                  <p>Adicione um novo usuário ao sistema</p>
                  <div className="feature-arrow">→</div>
                </Link>
              </div>
            </div>
          )}
        </main>

        <footer className="home-footer">
          <div className="footer-content">
            <p>&copy; hope you enjoy</p>
            <div className="footer-links">
              <a href="https://test-sps-server.onrender.com/api-docs/" target="_blank" rel="noopener noreferrer">
                Suporte
              </a>
              <a href="https://felipemiranda.dev.br" target="_blank" rel="noopener noreferrer">
                Suporte
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;