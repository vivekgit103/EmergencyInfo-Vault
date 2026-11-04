import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import Button from '../components/Button';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Log In - EmergencyInfo Vault';
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach(e => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-animated-wrap">
      <AnimatedBackground />

      <main id="main-content" className="content-layer" style={{ padding: '48px 0 64px' }}>
        <div className="container-narrow">
          <div className="form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <LogIn color="#0F5C4D" size={26} aria-hidden="true" />
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Log In to Your Vault</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Access your private emergency contacts, instructions, and share links.
            </p>

            {generalError && (
              <div className="alert alert-danger" role="alert" aria-live="polite">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div style={{ marginTop: '16px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  block
                  loading={submitting}
                >
                  {submitting ? 'Logging in...' : 'Log In'}
                </Button>
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
                Do not have an account? <Link to="/register">Create one now</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
