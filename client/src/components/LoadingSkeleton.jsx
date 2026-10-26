import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, color = 'var(--teal-700)' }) => (
  <Loader2
    size={size}
    style={{
      color,
      animation: 'spin 1s linear infinite'
    }}
  />
);

export const CardSkeleton = () => (
  <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
    <div className="skeleton" style={{ height: '190px', width: '100%' }} />
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '18px', width: '35%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '24px', width: '85%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '16px', width: '95%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '16px', width: '60%', borderRadius: '4px' }} />
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: '16px', width: '40%' }} />
        <div className="skeleton" style={{ height: '28px', width: '25%', borderRadius: '6px' }} />
      </div>
    </div>
  </div>
);

export const CardSkeletonGrid = ({ count = 6 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
      width: '100%'
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: '54px', width: '100%', borderRadius: '8px' }} />
    ))}
  </div>
);
