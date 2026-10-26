import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center', maxWidth: '520px' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--canvas-subtle)',
          color: 'var(--teal-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}
      >
        <Compass size={36} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--navy-900)', lineHeight: 1 }}>
        404
      </h1>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0.75rem 0' }}>
        Page Not Found
      </h2>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
        The campus page you are looking for does not exist or has been relocated. Let's get you back on track.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Return Home
        </Link>
        <Link to="/browse" className="btn btn-outline">
          <Search size={16} />
          Browse Items
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
