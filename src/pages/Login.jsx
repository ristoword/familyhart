/**
 * Login - Schermata di accesso
 * Collegata a stato reale: credenziali demo, sessione persistente
 * TODO: Integrare con backend - auth.service chiamerà API reale
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result?.error || 'Accesso fallito');
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim() || 'demo@familyhart.it', password || 'demo123');
      if (result?.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Usa le credenziali demo per provare');
      }
    } catch {
      setError('Usa le credenziali demo per provare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-brand">
          <div className="logo-icon">❤️</div>
          <h1 className="app-name">Family Hart</h1>
          <p className="app-tagline">La tua famiglia, sempre connessa</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <p className="login-error">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="demo@familyhart.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="fh-btn fh-btn-primary btn-login" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="login-divider">
          <span>oppure</span>
        </div>

        <div className="social-buttons">
          <button type="button" className="fh-btn fh-btn-secondary btn-social">
            <span className="social-icon">🍎</span>
            Continua con Apple
          </button>
          <button type="button" className="fh-btn fh-btn-secondary btn-social">
            <span className="social-icon">G</span>
            Continua con Google
          </button>
        </div>

        <button
          type="button"
          className="fh-btn btn-create-family"
          onClick={handleCreateFamily}
        >
          Crea famiglia
        </button>
      </div>
    </div>
  );
}
