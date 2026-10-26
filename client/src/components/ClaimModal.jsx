import React, { useState } from 'react';
import { X, ShieldCheck, Info } from 'lucide-react';
import { claimsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Spinner } from './LoadingSkeleton';

const ClaimModal = ({ isOpen, onClose, item, onClaimSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 10) {
      setError('Please provide at least 10 characters detailing proof of ownership.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await claimsAPI.createClaim(item._id, { message: message.trim() });
      toast.success(res.data.message || 'Claim submitted successfully!');
      setMessage('');
      if (onClaimSuccess) onClaimSuccess(res.data.data);
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Submit Ownership Claim
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                For item: <strong style={{ color: 'var(--navy-800)' }}>{item.title}</strong>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}
            >
              <Info size={18} style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8125rem', color: '#0f766e', lineHeight: 1.45 }}>
                To ensure items are returned to their genuine owners, describe specific identifiers only the owner would know (e.g. wallpaper, passwords, distinctive scratch, exact contents, or purchase date).
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="claimMessage">
                Proof &amp; Details of Ownership <span className="required">*</span>
              </label>
              <textarea
                id="claimMessage"
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (error) setError('');
                }}
                maxLength={600}
                placeholder="Describe specific unique details, markings, stickers, serial numbers, or time of loss that prove this item belongs to you..."
                disabled={loading}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span className="form-helper">Minimum 10 characters</span>
                <span style={{ fontSize: '0.75rem', color: message.length > 550 ? 'var(--lost-red)' : 'var(--text-muted)' }}>
                  {message.length} / 600
                </span>
              </div>
              {error && <p className="form-error">{error}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading && <Spinner size={16} color="#ffffff" />}
              Send Claim Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
