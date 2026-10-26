import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Layers,
  Clock,
  CheckCircle,
  FileText,
  Trash2,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { ReportTypeBadge, ItemStatusBadge } from '../components/StatusBadge';
import { TableSkeleton, Spinner } from '../components/LoadingSkeleton';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatDate, timeAgo } from '../utils/formatters';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('reports');
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state for reports
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Administrator privileges required.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [overviewRes, reportsRes, claimsRes] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getReports({
          search: searchTerm,
          status: statusFilter,
          reportType: typeFilter
        }),
        adminAPI.getClaims()
      ]);

      setOverview(overviewRes.data?.data || null);
      setReports(reportsRes.data?.data || []);
      setClaims(claimsRes.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load administrator portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      await adminAPI.updateReportStatus(reportId, newStatus);
      toast.success(`Report status updated to ${newStatus}`);
      await fetchAdminData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      setActionLoading(true);
      await adminAPI.deleteReport(reportToDelete._id);
      toast.success('Inappropriate report permanently removed.');
      setDeleteModalOpen(false);
      setReportToDelete(null);
      await fetchAdminData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <Spinner size={36} />
      </div>
    );
  }

  const stats = overview?.stats || {};

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Admin Title Bar */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          backgroundColor: '#0a1128',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#6d28d9',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Campus Administration Portal
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              Findora Moderation &amp; Oversight
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="btn btn-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          Refresh Data
        </button>
      </div>

      {/* Admin Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard title="Registered Users" value={stats.totalUsers || 0} icon={Users} color="#6d28d9" />
        <StatCard title="Total Campus Reports" value={stats.totalReports || 0} icon={Layers} color="#0f766e" />
        <StatCard title="Active Open Reports" value={stats.openReports || 0} icon={Clock} color="#0284c7" />
        <StatCard title="Pending Claims" value={stats.pendingClaims || 0} icon={ShieldCheck} color="#d97706" />
        <StatCard title="Resolved Cases" value={stats.resolvedReports || 0} icon={CheckCircle} color="#059669" />
      </div>

      {/* Sub-Tabs: Reports Moderation vs Claims Log */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '2px solid var(--canvas-border)',
          marginBottom: '1.5rem'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '0.65rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'reports' ? '2px solid var(--navy-900)' : '2px solid transparent',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
            color: activeTab === 'reports' ? 'var(--navy-900)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'reports' ? 700 : 500,
            fontSize: '0.9375rem',
            cursor: 'pointer'
          }}
        >
          All Campus Reports ({reports.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          style={{
            padding: '0.65rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'claims' ? '2px solid var(--navy-900)' : '2px solid transparent',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
            color: activeTab === 'claims' ? 'var(--navy-900)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'claims' ? 700 : 500,
            fontSize: '0.9375rem',
            cursor: 'pointer'
          }}
        >
          Campus Claims Log ({claims.length})
        </button>
      </div>

      {/* TAB 1: Reports Moderation */}
      {activeTab === 'reports' && (
        <div>
          {/* Moderation Search & Filter Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search reports by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '320px' }}
            />

            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '160px' }}
            >
              <option value="All">All Statuses</option>
              <option value="open">Open</option>
              <option value="claim_pending">Claim Pending</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ maxWidth: '160px' }}
            >
              <option value="All">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>

            <button type="submit" className="btn btn-outline btn-sm">
              <Search size={14} />
              Filter
            </button>
          </form>

          {/* Table of Reports */}
          {loading ? (
            <TableSkeleton rows={6} />
          ) : reports.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No reports match the moderation filters.</p>
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto', border: '1px solid var(--canvas-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--canvas-subtle)', borderBottom: '1px solid var(--canvas-border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Item Title</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Type &amp; Category</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Reporter</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Location</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      style={{ borderBottom: '1px solid var(--canvas-border)', transition: 'background-color 0.15s ease' }}
                    >
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                        <Link to={`/items/${report._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {report.title}
                        </Link>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <ReportTypeBadge type={report.reportType} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.category}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontSize: '0.8125rem' }}>
                          <strong>{report.reporter?.name || 'Unknown'}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {report.reporter?.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                        {report.location}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report._id, e.target.value)}
                          disabled={actionLoading}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--canvas-border)',
                            backgroundColor: 'var(--canvas-card)',
                            fontWeight: 600
                          }}
                        >
                          <option value="open">Open</option>
                          <option value="claim_pending">Claim Pending</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <Link to={`/items/${report._id}`} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                            <ExternalLink size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setReportToDelete(report);
                              setDeleteModalOpen(true);
                            }}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.3rem 0.5rem' }}
                            title="Remove Inappropriate Report"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Campus Claims Log */}
      {activeTab === 'claims' && (
        <div>
          {claims.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No claim records logged in the database.</p>
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto', border: '1px solid var(--canvas-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--canvas-subtle)', borderBottom: '1px solid var(--canvas-border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Target Item</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Claimant</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Ownership Proof Message</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--navy-900)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim._id} style={{ borderBottom: '1px solid var(--canvas-border)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                        {claim.item ? (
                          <Link to={`/items/${claim.item._id || claim.item}`} style={{ color: 'var(--teal-700)' }}>
                            {claim.item.title || 'View Item'}
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Item Removed</span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div>{claim.requester?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{claim.requester?.email}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', maxWidth: '300px' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          "{claim.message}"
                        </p>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(claim.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal: Delete Report by Admin */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Admin: Remove Inappropriate Report?"
        message={`Are you sure you want to remove "${reportToDelete?.title}"? This permanently cleanses the report and its associated claim inquiries.`}
        confirmText="Remove Report"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminDashboardPage;
