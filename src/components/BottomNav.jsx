/**
 * BottomNav - Menu di navigazione fisso in basso
 * Utilizzato nelle schermate principali dell'app
 */

import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/map', icon: '🗺️', label: 'Mappa' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/notifications', icon: '🔔', label: 'Avvisi' },
  { path: '/profile', icon: '👤', label: 'Profilo' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
