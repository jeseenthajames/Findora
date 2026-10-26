import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#0f766e', subtitle }) => {
  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0
        }}
      >
        <Icon size={26} strokeWidth={2} />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </p>
        <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.15rem' }}>
          {value !== undefined ? value.toLocaleString() : '0'}
        </h4>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative accent corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color
        }}
      />
    </div>
  );
};

export default StatCard;
