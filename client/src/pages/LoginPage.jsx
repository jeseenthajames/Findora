import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Compass, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/LoadingSkeleton';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '4rem', maxWidth: '480px' }}>
      <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--canvas-border)' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--navy-900)',
              color: '#5eead4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}
          >
            <Compass size={28} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Sign In to Findora
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Campus Lost-and-Found Management System
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="loginEmail">
              Campus Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              className="form-control"
              placeholder="e.g. yourname@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="loginPassword">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading && <Spinner size={16} color="#ffffff" />}
            Sign In
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px dashed var(--canvas-border)',
            textAlign: 'left'
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.75rem'
            }}
          >
            Quick-Fill Demo Credentials (1-Click)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@findora.campus.edu', 'AdminPass123!')}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start', color: '#6d28d9', borderColor: '#ddd6fe' }}
            >
              <ShieldAlert size={14} />
              Admin: admin@findora.campus.edu
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('alex@findora.campus.edu', 'FindoraDemo123!')}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <UserCheck size={14} />
              Student: alex@findora.campus.edu
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('priya@findora.campus.edu', 'FindoraDemo123!')}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <UserCheck size={14} />
              Student: priya@findora.campus.edu
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--teal-700)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
