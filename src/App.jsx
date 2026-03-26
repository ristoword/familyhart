/**
 * Family Hart - App principale
 * Router e protezione route per utenti autenticati
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './store/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import CallOverlay from './components/CallOverlay';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import MemberDetail from './pages/MemberDetail';
import Chat from './pages/Chat';
import SOS from './pages/SOS';
import Notifications from './pages/Notifications';
import SafePlaces from './pages/SafePlaces';
import Profile from './pages/Profile';
import Agenda from './pages/Agenda';

function App() {
  const { isAuthenticated, backendLoading } = useApp();

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          backendLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Caricamento...</div>
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/:id"
        element={
          <ProtectedRoute>
            <MemberDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sos"
        element={
          <ProtectedRoute>
            <SOS />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/safe-places"
        element={
          <ProtectedRoute>
            <SafePlaces />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {isAuthenticated && <CallOverlay />}
    </>
  );
}

export default App;
