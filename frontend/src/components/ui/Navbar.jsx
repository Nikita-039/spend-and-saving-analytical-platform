import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Table2, TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo"><TrendingUp size={18} /></div>
        <span className="navbar-title">SpendIQ</span>
      </div>

      <div className="navbar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>
        <NavLink to="/data" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Table2 size={16} />
          Data Table
        </NavLink>
      </div>

      <div className="navbar-right">
        <div className="user-chip">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <span>{user?.name}</span>
        </div>
        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}
