/**
 * ProtectedRoute - Protegge le schermate che richiedono autenticazione
 * Reindirizza al login se l'utente non è autenticato
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, backendLoading } = useApp();
  const location = useLocation();

  if (backendLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        Caricamento...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
