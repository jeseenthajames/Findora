import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileQuestion,
  PlusCircle,
  Inbox,
  Send,
  CheckCircle,
  Clock,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Edit,
  ArrowRight,
  User,
  AlertCircle
} from 'lucide-react';
import { itemsAPI, claimsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReportTypeBadge, ItemStatusBadge } from '../components/StatusBadge';
import { TableSkeleton, Spinner } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatDate, timeAgo } from '../utils/formatters';
import toast from 'react-hot-toast';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lost');

  const [myItems, setMyItems] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [outgoingClaims, setOutgoingClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [itemsRes, incomingRes, outgoingRes] = await Promise.all([
        itemsAPI.getMyItems(),
        claimsAPI.getIncomingClaims(),
        claimsAPI.getMyClaims()
      ]);

      setMyItems(itemsRes.data?.data || []);
      setIncomingClaims(incomingRes.data?.data || []);
      setOutgoingClaims(outgoingRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveClaim = async (claimId) => {
    try {
      setActionLoading(true);
      await claimsAPI.approveClaim(claimId);
      toast.success('Claim approved! Item has been marked as resolved.');
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      setActionLoading(true);
      await claimsAPI.rejectClaim(claimId);
      toast.success('Claim rejected.');
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!selectedItemId) return;
    try {
      setActionLoading(true);
      await itemsAPI.resolveItem(selectedItemId);
      toast.success('Item marked as resolved!');
      setResolveModalOpen(false);
      setSelectedItemId(null);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItemId) return;
    try {
      setActionLoading(true);
      await itemsAPI.deleteItem(selectedItemId);
      toast.success('Report deleted.');
      setDeleteModalOpen(false);
      setSelectedItemId(null);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered views
  const lostReports = myItems.filter((i) => i.reportType === 'lost' && i.status !== 'resolved');
  const foundReports = myItems.filter((i) => i.reportType === 'found' && i.status !== 'resolved');
  const resolvedReports = myItems.filter((i) => i.status === 'resolved');
  const pendingIncoming = incomingClaims.filter((c) => c.status === 'pending');

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#5eead4',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.35rem'
              }}
            >
              Student &amp; Staff Dashboard
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              Welcome, {user?.name || 'Campus Member'}!
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Manage your reports, review incoming ownership claims, and check claim requests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/report-lost" className="btn btn-sm" style={{ backgroundColor: 'var(--lost-red)', color: '#ffffff' }}>
              <FileQuestion size={15} />
              Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              Report Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            My Active Lost Reports
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lost-red)', marginTop: '0.25rem' }}>
            {lostReports.length}
          </h3>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            My Active Found Reports
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--found-green)', marginTop: '0.25rem' }}>
            {foundReports.length}
          </h3>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Incoming Claims to Review
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: pendingIncoming.length > 0 ? '#d97706' : 'var(--navy-900)', marginTop: '0.25rem' }}>
            {pendingIncoming.length}
          </h3>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Resolved Cases
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--teal-700)', marginTop: '0.25rem' }}>
            {resolvedReports.length}
          </h3>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--canvas-border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}
      >
        {[
          { key: 'lost', label: `My Lost Reports (${lostReports.length})`, icon: FileQuestion },
          { key: 'found', label: `My Found Reports (${foundReports.length})`, icon: PlusCircle },
          { key: 'incoming', label: `Incoming Claims (${incomingClaims.length})`, icon: Inbox, alert: pendingIncoming.length > 0 },
          { key: 'outgoing', label: `Outgoing Claims Sent (${outgoingClaims.length})`, icon: Send },
          { key: 'resolved', label: `Resolved (${resolvedReports.length})`, icon: CheckCircle }
        ].map((tab) => {
          const isCurrent = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                border: 'none',
                borderBottom: isCurrent ? '2px solid var(--teal-700)' : '2px solid transparent',
                marginBottom: '-2px',
                backgroundColor: 'transparent',
                color: isCurrent ? 'var(--teal-700)' : 'var(--text-secondary)',
                fontWeight: isCurrent ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.alert && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d97706' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div>
          {/* TAB 1: My Lost Reports */}
          {activeTab === 'lost' && (
            lostReports.length === 0 ? (
              <EmptyState
                icon={FileQuestion}
                title="No active lost reports"
                message="You have no open reports for lost belongings right now."
                actionLabel="Report a Lost Item"
                actionLink="/report-lost"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {lostReports.map((item) => (
                  <div
                    key={item._id}
                    className="card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <ItemStatusBadge status={item.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Lost on {formatDate(item.eventDate)} • {item.location}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        <Link to={`/items/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                      <Link to={`/items/${item._id}/edit`} className="btn btn-outline btn-sm">
                        <Edit size={14} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemId(item._id);
                          setResolveModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--found-green)', borderColor: 'var(--found-green)' }}
                      >
                        <CheckCircle size={14} />
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemId(item._id);
                          setDeleteModalOpen(true);
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: My Found Reports */}
          {activeTab === 'found' && (
            foundReports.length === 0 ? (
              <EmptyState
                icon={PlusCircle}
                title="No active found reports"
                message="You have no open reports for items you found on campus."
                actionLabel="Report a Found Item"
                actionLink="/report-found"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {foundReports.map((item) => (
                  <div
                    key={item._id}
                    className="card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <ItemStatusBadge status={item.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Found on {formatDate(item.eventDate)} • {item.location}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        <Link to={`/items/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                      <Link to={`/items/${item._id}/edit`} className="btn btn-outline btn-sm">
                        <Edit size={14} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemId(item._id);
                          setResolveModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--found-green)', borderColor: 'var(--found-green)' }}
                      >
                        <CheckCircle size={14} />
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemId(item._id);
                          setDeleteModalOpen(true);
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: Incoming Claims */}
          {activeTab === 'incoming' && (
            incomingClaims.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No incoming claims"
                message="No one has submitted an ownership claim on items you reported finding yet."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      borderLeft: `4px solid ${
                        claim.status === 'pending'
                          ? '#d97706'
                          : claim.status === 'approved'
                          ? 'var(--found-green)'
                          : 'var(--lost-red)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Received {timeAgo(claim.createdAt)}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                          Claim for: {claim.item?.title || 'Reported Item'}
                        </h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--teal-800)', fontWeight: 600 }}>
                          Claimant: {claim.requester?.name} ({claim.requester?.email})
                        </p>
                      </div>

                      {claim.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleApproveClaim(claim._id)}
                            className="btn btn-primary btn-sm"
                            disabled={actionLoading}
                            style={{ gap: '0.25rem', backgroundColor: 'var(--found-green)', borderColor: 'var(--found-green)' }}
                          >
                            <Check size={14} />
                            Approve Claim
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectClaim(claim._id)}
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading}
                            style={{ gap: '0.25rem' }}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        backgroundColor: 'var(--canvas-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.875rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--navy-900)',
                        lineHeight: 1.5
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        CLAIMANT'S PROOF OF OWNERSHIP:
                      </strong>
                      "{claim.message}"
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 4: Outgoing Claims Sent */}
          {activeTab === 'outgoing' && (
            outgoingClaims.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No claims submitted yet"
                message="You haven't submitted any ownership claims for found items."
                actionLabel="Browse Found Items"
                actionLink="/browse?reportType=found"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingClaims.map((claim) => (
                  <div key={claim._id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Submitted {timeAgo(claim.createdAt)}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                          Item: {claim.item?.title || 'Found Belonging'}
                        </h4>
                      </div>

                      {claim.item && (
                        <Link to={`/items/${claim.item._id || claim.item}`} className="btn btn-outline btn-sm">
                          View Item Page
                        </Link>
                      )}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                      Your message: "{claim.message}"
                    </p>

                    {claim.status === 'approved' && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#ecfdf5',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          color: '#047857',
                          fontWeight: 600
                        }}
                      >
                        ✓ Claim Approved! Please coordinate handover safely at campus security or designated office.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 5: Resolved Cases */}
          {activeTab === 'resolved' && (
            resolvedReports.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No resolved cases yet"
                message="When you mark reports as resolved or approve a claim, they will appear here."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {resolvedReports.map((item) => (
                  <div
                    key={item._id}
                    className="card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <ReportTypeBadge type={item.reportType} />
                        <span className="badge badge-resolved">Resolved</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Resolved on {formatDate(item.resolvedAt || item.updatedAt)}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {item.title}
                      </h4>
                    </div>

                    <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm">
                      View Report
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Confirmation Modal: Resolve Item */}
      <ConfirmationModal
        isOpen={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setSelectedItemId(null);
        }}
        onConfirm={handleConfirmResolve}
        title="Mark Item as Resolved?"
        message="Are you sure this item has been returned? Once marked resolved, it will be catalogued as complete."
        confirmText="Confirm Resolved"
        loading={actionLoading}
      />

      {/* Confirmation Modal: Delete Report */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItemId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Report?"
        message="Are you sure you want to permanently delete this report? This cannot be undone."
        confirmText="Delete"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default UserDashboardPage;
