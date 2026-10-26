import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/LoadingSkeleton';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await register(name.trim(), email.trim(), password, confirmPassword);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '480px' }}>
      <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--canvas-border)' }}>
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
            Join Findora
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Campus Lost-and-Found Community
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
            <label className="form-label" htmlFor="regName">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="regName"
              type="text"
              className="form-control"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regEmail">
              Campus Email Address <span className="required">*</span>
            </label>
            <input
              id="regEmail"
              type="email"
              className="form-control"
              placeholder="e.g. alex@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regPassword">
              Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="regPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="At least 6 characters"
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

          <div className="form-group">
            <label className="form-label" htmlFor="regConfirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="regConfirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading && <Spinner size={16} color="#ffffff" />}
            Create Free Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal-700)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
