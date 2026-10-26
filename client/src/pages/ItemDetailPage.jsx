import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Edit,
  CheckCircle,
  Trash2,
  ArrowLeft,
  Share2,
  AlertCircle
} from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReportTypeBadge, ItemStatusBadge } from '../components/StatusBadge';
import ClaimModal from '../components/ClaimModal';
import MatchSuggestionsModal from '../components/MatchSuggestionsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Spinner } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDate, timeAgo, getCategoryColor } from '../utils/formatters';
import toast from 'react-hot-toast';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await itemsAPI.getItemById(id);
        setItem(res.data?.data || null);
      } catch (err) {
        setError(err.message || 'Report not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const isOwner = user && item?.reporter?._id && String(user.id || user._id) === String(item.reporter._id);
  const canManage = isOwner || isAdmin;
  const isFound = item?.reportType === 'found';
  const isResolved = item?.status === 'resolved';

  const handleResolve = async () => {
    try {
      setActionLoading(true);
      const res = await itemsAPI.resolveItem(item._id);
      setItem(res.data?.data || { ...item, status: 'resolved', resolvedAt: new Date() });
      toast.success('Item marked as resolved!');
      setResolveModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await itemsAPI.deleteItem(item._id);
      toast.success('Item report deleted.');
      setDeleteModalOpen(false);
      navigate('/browse');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Spinner size={36} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Loading campus report details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <EmptyState
          icon={AlertCircle}
          title="Item Report Not Found"
          message={error || 'This report may have been deleted or the link is incorrect.'}
          actionLabel="Browse Available Reports"
          actionLink="/browse"
        />
      </div>
    );
  }

  const catColor = getCategoryColor(item.category);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Back button & share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.35rem' }}
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.35rem' }}
        >
          <Share2 size={15} />
          Share Link
        </button>
      </div>

      {/* Main Grid: Left Details & Right Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Media & Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Item Image Card */}
          <div
            className="card"
            style={{
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {item.imageUrl && !imgError ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  gap: '0.75rem'
                }}
              >
                <Tag size={56} strokeWidth={1.5} style={{ opacity: 0.8 }} />
                <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{item.category}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No public photograph uploaded</span>
              </div>
            )}

            {/* Badges on image */}
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}
            >
              <ReportTypeBadge type={item.reportType} />
              <ItemStatusBadge status={item.status} />
            </div>
          </div>

          {/* Description Section */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
              Item Description &amp; Identifying Details
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--navy-900)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {item.description}
            </p>
          </div>
        </div>

        {/* Right Column: Key Metadata & Actions Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            {/* Category Pill */}
            <div style={{ marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: catColor.bg,
                  color: catColor.text,
                  border: `1px solid ${catColor.border}`
                }}
              >
                {item.category}
              </span>
            </div>

            {/* Main Title */}
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', lineHeight: 1.25, marginBottom: '1.5rem' }}>
              {item.title}
            </h1>

            {/* Metadata Rows */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--canvas-border)',
                marginBottom: '1.5rem'
              }}
            >
              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    CAMPUS LOCATION
                  </span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                    {item.location}
                  </span>
                </div>
              </div>

              {/* Event Date */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Calendar size={18} style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    DATE {item.reportType.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                    {formatDate(item.eventDate)}
                  </span>
                </div>
              </div>

              {/* Reported By */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <User size={18} style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    REPORTED BY
                  </span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                    {item.reporter?.name || 'Campus Community Member'}
                  </span>
                  {item.reporter?.email && (
                    <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {item.reporter.email} (Visible only to authorized party)
                    </span>
                  )}
                </div>
              </div>

              {/* Creation timestamp */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    REPORT POSTED
                  </span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                    {timeAgo(item.createdAt)} ({formatDate(item.createdAt)})
                  </span>
                </div>
              </div>
            </div>

            {/* Resolved Status Notification if resolved */}
            {isResolved && (
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <CheckCircle size={22} style={{ color: '#475569', flexShrink: 0 }} />
                <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.45 }}>
                  <strong>Case Resolved:</strong> This item was marked as returned/reclaimed on{' '}
                  {formatDate(item.resolvedAt || item.updatedAt)}.
                </div>
              </div>
            )}

            {/* Actions Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Claim Button: Available for open found items when user is not the reporter */}
              {isFound && !isResolved && !isOwner && (
                isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(true)}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', gap: '0.5rem' }}
                  >
                    <ShieldCheck size={18} />
                    This Is My Item — Submit Claim
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', gap: '0.5rem', textAlign: 'center' }}
                  >
                    <ShieldCheck size={18} />
                    Sign In to Submit Claim
                  </Link>
                )
              )}

              {/* Potential Match Analysis Button */}
              <button
                type="button"
                onClick={() => setMatchModalOpen(true)}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  gap: '0.5rem',
                  borderColor: 'var(--navy-900)',
                  color: 'var(--navy-900)'
                }}
              >
                <Sparkles size={16} style={{ color: 'var(--teal-700)' }} />
                Check Potential Matches in Campus Database
              </button>

              {/* Owner / Admin Management Actions */}
              {canManage && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--canvas-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Reporter Management Actions
                  </span>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/items/${item._id}/edit`}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, gap: '0.35rem' }}
                    >
                      <Edit size={14} />
                      Edit Details
                    </Link>

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => setResolveModalOpen(true)}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, gap: '0.35rem', color: 'var(--found-green)', borderColor: 'var(--found-green)' }}
                      >
                        <CheckCircle size={14} />
                        Mark Resolved
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="btn btn-danger btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={item}
        onClaimSuccess={() => {
          setItem({ ...item, status: 'claim_pending' });
        }}
      />

      {/* Potential Match Suggestions Modal */}
      <MatchSuggestionsModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        itemId={item._id}
        itemTitle={item.title}
        reportType={item.reportType}
      />

      {/* Confirmation Modal: Mark Resolved */}
      <ConfirmationModal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        onConfirm={handleResolve}
        title="Mark Item as Resolved?"
        message="Are you sure this item has been successfully reunited or recovered? Once resolved, no new claims can be submitted."
        confirmText="Yes, Mark Resolved"
        loading={actionLoading}
      />

      {/* Confirmation Modal: Delete Report */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item Report?"
        message="Are you sure you want to permanently remove this report? All associated claim records will also be removed. This action cannot be undone."
        confirmText="Delete Report"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default ItemDetailPage;
