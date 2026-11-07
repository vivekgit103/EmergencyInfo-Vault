import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, ArrowRight } from 'lucide-react';
import Button from './Button';

// Simple Geometric Shield SVG
function ShieldMark({ size = 24, color = '#5FB8A3' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAppPage = location.pathname.startsWith('/dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDrawerRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Escape key and focus trap for mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        if (menuButtonRef.current) {
          menuButtonRef.current.focus();
        }
        return;
      }

      if (e.key === 'Tab' && mobileDrawerRef.current) {
        const focusableElements = mobileDrawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // 1. APPLICATION HEADER (Solid Light Header for Dashboard & Preview)
  if (isAppPage) {
    return (
      <header className="app-header" role="banner">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="container app-header-inner">
          <Link to="/dashboard" className="nav-brand" aria-label="EmergencyInfo Vault Dashboard">
            <ShieldMark size={26} color="#0F5C4D" />
            <span className="nav-brand-text" style={{ color: '#1B1B1B' }}>EmergencyInfo Vault</span>
          </Link>

          <nav className="app-header-nav" role="navigation" aria-label="Vault Navigation">
            <NavLink to="/dashboard" end>
              Vault Records
            </NavLink>
            <NavLink to="/dashboard/preview">
              Preview Card
            </NavLink>
            {user && (
              <span style={{ fontSize: '0.9375rem', color: '#4A4A45', fontWeight: 700, padding: '0 8px' }}>
                {user.name}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              aria-label="Log out of your account"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Log out</span>
            </Button>
          </nav>
        </div>
      </header>
    );
  }

  // 2. FLOATING GLASS NAV PILL (Marketing & Auth Pages)
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="floating-nav-pill-wrap">
        <header className="floating-nav-pill" role="banner">
          {/* Left: Brand mark & serif wordmark */}
          <Link to="/" className="nav-brand" aria-label="EmergencyInfo Vault Home">
            <ShieldMark size={24} color="#5FB8A3" />
            <span className="nav-brand-text">EmergencyInfo Vault</span>
          </Link>

          {/* Centre: Links (hidden under 640px) */}
          <nav className="nav-links-center" role="navigation" aria-label="Main Navigation">
            <NavLink to="/how-it-works" className="nav-link-item">
              How it works
            </NavLink>
            <NavLink to="/privacy" className="nav-link-item">
              Privacy
            </NavLink>
            <NavLink to="/terms" className="nav-link-item">
              Terms
            </NavLink>
          </nav>

          {/* Right: Actions */}
          <div className="nav-right-actions">
            {user ? (
              <>
                <Button to="/dashboard" variant="primary" size="sm">
                  Dashboard
                </Button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-login-link"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-login-link">
                  Log in
                </Link>
                <Button to="/register" variant="primary" size="sm">
                  Create account
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle Button (<640px) */}
            <button
              ref={menuButtonRef}
              type="button"
              className="nav-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </header>
      </div>

      {/* Accessible Mobile Nav Drawer (<640px) */}
      {mobileMenuOpen && (
        <nav
          ref={mobileDrawerRef}
          id="mobile-nav-menu"
          className="mobile-nav-drawer"
          role="navigation"
          aria-label="Mobile Navigation"
        >
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/how-it-works" onClick={() => setMobileMenuOpen(false)}>
            How it works
          </NavLink>
          <NavLink to="/privacy" onClick={() => setMobileMenuOpen(false)}>
            Privacy Policy
          </NavLink>
          <NavLink to="/terms" onClick={() => setMobileMenuOpen(false)}>
            Terms and Conditions
          </NavLink>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user ? (
              <>
                <Button to="/dashboard" variant="primary" size="md" block onClick={() => setMobileMenuOpen(false)}>
                  Go to Dashboard
                </Button>
                <Button variant="secondary" size="md" block onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button to="/register" variant="primary" size="md" block onClick={() => setMobileMenuOpen(false)}>
                  Create account
                </Button>
                <Button to="/login" variant="secondary" size="md" block onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
