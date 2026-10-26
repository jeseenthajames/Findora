import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { ReportTypeBadge, ItemStatusBadge } from './StatusBadge';
import { formatDate, getCategoryColor } from '../utils/formatters';

const ItemCard = ({ item, matchScore, matchStrength, matchReasons }) => {
  const [imgError, setImgError] = useState(false);
  const catColor = getCategoryColor(item.category);

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card Image / Fallback Container */}
      <div
        style={{
          position: 'relative',
          height: '190px',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${catColor.bg} 0%, #ffffff 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: catColor.text,
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <Tag size={36} strokeWidth={1.5} style={{ opacity: 0.8, marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{item.category}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            right: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <ReportTypeBadge type={item.reportType} />
          <ItemStatusBadge status={item.status} />
        </div>

        {/* Optional Potential Match Pill */}
        {matchScore !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              backgroundColor: 'rgba(10, 17, 40, 0.88)',
              backdropFilter: 'blur(4px)',
              color: '#5eead4',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={13} />
            {matchScore}% Match • {matchStrength}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category Pill */}
        <div style={{ marginBottom: '0.625rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: catColor.bg,
              color: catColor.text,
              border: `1px solid ${catColor.border}`
            }}
          >
            {item.category}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: 'var(--navy-900)',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {item.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.45
          }}
        >
          {item.description}
        </p>

        {/* Metadata Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.875rem',
            borderTop: '1px solid var(--canvas-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <MapPin size={14} style={{ color: 'var(--teal-700)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.location}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={14} style={{ flexShrink: 0 }} />
              <span>{formatDate(item.eventDate)}</span>
            </div>

            <Link
              to={`/items/${item._id}`}
              className="btn btn-outline btn-sm"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                gap: '0.25rem',
                borderColor: 'var(--canvas-border)'
              }}
            >
              Details
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Match reasons explanation preview if provided */}
        {matchReasons && matchReasons.length > 0 && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.65rem',
              backgroundColor: 'var(--canvas-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--navy-800)'
            }}
          >
            <strong>Why suggested:</strong> {matchReasons[0]}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
