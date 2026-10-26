import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Spinner } from './LoadingSkeleton';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isDanger && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={18} />
              </div>
            )}
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)' }}>{title}</h3>
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
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm" disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading && <Spinner size={16} color="#ffffff" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
