import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { Spinner } from './LoadingSkeleton';
import { formatDate } from '../utils/formatters';

const MatchSuggestionsModal = ({ isOpen, onClose, itemId, itemTitle, reportType }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !itemId) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await itemsAPI.getMatches(itemId);
        setMatches(res.data?.data || []);
      } catch (err) {
        setError(err.message || 'Failed to analyze potential matches.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  const targetType = reportType === 'lost' ? 'Found' : 'Lost';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--navy-900)',
                color: '#5eead4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Potential Matches Suggested
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Comparing against open {targetType.toLowerCase()} reports on campus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Explanation Banner */}
          <div
            style={{
              backgroundColor: 'var(--canvas-subtle)',
              border: '1px solid var(--canvas-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45
            }}
          >
            <strong>Rule-Based Analysis:</strong> Candidates are evaluated using weighted criteria including item category, title keywords, campus location, and date proximity.
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', gap: '1rem' }}>
              <Spinner size={32} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Scanning open campus reports for similarities...
              </p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--lost-red)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <p>{error}</p>
            </div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                No close candidate matches found yet
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                We could not find an existing open {targetType.toLowerCase()} report matching this item's category and keywords. Check back soon or browse all open reports.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matches.map((m) => {
                const candidate = m.item;
                const scoreColor = m.score >= 65 ? 'var(--found-green)' : m.score >= 40 ? 'var(--teal-700)' : '#d97706';

                return (
                  <div
                    key={candidate._id}
                    className="card"
                    style={{
                      padding: '1rem 1.25rem',
                      border: '1px solid var(--canvas-border)',
                      backgroundColor: 'var(--canvas-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: scoreColor,
                              backgroundColor: `${scoreColor}15`,
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            {m.score}% Match • {m.matchStrength}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Reported {formatDate(candidate.eventDate)}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                          {candidate.title}
                        </h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          📍 {candidate.location}
                        </p>
                      </div>

                      <Link
                        to={`/items/${candidate._id}`}
                        onClick={onClose}
                        className="btn btn-outline btn-sm"
                        style={{ flexShrink: 0, gap: '0.25rem' }}
                      >
                        View Item
                        <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Explanatory Reasons */}
                    <div
                      style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.65rem',
                        borderTop: '1px dashed var(--canvas-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                        Why this was matched:
                      </span>
                      {m.reasons.map((r, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: scoreColor, flexShrink: 0 }} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSuggestionsModal;
