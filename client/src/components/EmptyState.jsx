import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No reports found',
  message = 'There are no records matching your current filter criteria.',
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '540px',
        margin: '2rem auto',
        backgroundColor: 'var(--canvas-card)'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--canvas-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '380px' }}>
        {message}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button type="button" onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
