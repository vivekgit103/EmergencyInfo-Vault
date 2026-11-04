import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header" role="banner">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="container header-inner">
        <Link to="/" className="site-logo" aria-label="EmergencyInfo Vault Home">
          <ShieldAlert color="#0F5C4D" size={28} aria-hidden="true" />
          <span>EmergencyInfo Vault</span>
        </Link>

        <nav className="site-nav" role="navigation" aria-label="Main Navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/how-it-works">How it works</NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                aria-label="Log out of your account"
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Log out</span>
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Button to="/register" variant="primary" size="sm">
                Get started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
