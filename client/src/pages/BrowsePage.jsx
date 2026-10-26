import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import { CardSkeletonGrid } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../utils/formatters';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states initialized from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [reportType, setReportType] = useState(searchParams.get('reportType') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch items whenever filters or page change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page,
          limit: 12,
          sortBy
        };

        if (search.trim()) params.search = search.trim();
        if (reportType !== 'All') params.reportType = reportType.toLowerCase();
        if (category !== 'All') params.category = category;
        if (location.trim()) params.location = location.trim();
        if (status !== 'All') params.status = status;

        const res = await itemsAPI.getItems(params);
        setItems(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve reports from campus database.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [search, reportType, category, location, status, sortBy, page]);

  // Sync to URL
  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === 'All') {
        updated.delete(k);
      } else {
        updated.set(k, v);
      }
    });
    setSearchParams(updated, { replace: true });
  };

  const handleResetFilters = () => {
    setSearch('');
    setReportType('All');
    setCategory('All');
    setLocation('');
    setStatus('All');
    setSortBy('newest');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    reportType !== 'All' ||
    category !== 'All' ||
    location.trim() !== '' ||
    status !== 'All' ||
    sortBy !== 'newest';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
          Browse Campus Reports
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Search active lost items or browse found belongings across all university locations
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid var(--canvas-border)',
          backgroundColor: 'var(--canvas-card)'
        }}
      >
        {/* Top Row: Search and Lost/Found Toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search title, description, or campus keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                updateUrlParams({ search: e.target.value, page: 1 });
              }}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          {/* Lost / Found / All Toggle Buttons */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--canvas-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem',
              border: '1px solid var(--canvas-border)'
            }}
          >
            {['All', 'lost', 'found'].map((type) => {
              const isSelected = reportType.toLowerCase() === type.toLowerCase();
              const label = type === 'All' ? 'All Reports' : type === 'lost' ? 'Lost Only' : 'Found Only';
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setReportType(type);
                    setPage(1);
                    updateUrlParams({ reportType: type, page: 1 });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--canvas-card)' : 'transparent',
                    color: isSelected ? 'var(--navy-900)' : 'var(--text-muted)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end'
          }}
        >
          {/* Category Dropdown */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
                updateUrlParams({ category: e.target.value, page: 1 });
              }}
              style={{ fontSize: '0.875rem', padding: '0.55rem 0.75rem' }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Campus Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 'Library', 'Dining'..."
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
                updateUrlParams({ location: e.target.value, page: 1 });
              }}
              style={{ fontSize: '0.875rem', padding: '0.55rem 0.75rem' }}
            />
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
                updateUrlParams({ status: e.target.value, page: 1 });
              }}
              style={{ fontSize: '0.875rem', padding: '0.55rem 0.75rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="open">Open</option>
              <option value="claim_pending">Claim Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort Order</label>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
                updateUrlParams({ sortBy: e.target.value, page: 1 });
              }}
              style={{ fontSize: '0.875rem', padding: '0.55rem 0.75rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="date">Event Date</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  fontSize: '0.8125rem',
                  padding: '0.55rem 0.85rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <RotateCcw size={14} />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing {items.length} of {pagination.total} campus reports
        </p>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <CardSkeletonGrid count={8} />
      ) : error ? (
        <EmptyState
          title="Error retrieving reports"
          message={error}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No matching reports found"
          message="No reports match your current search terms or filter selections. Try clearing your filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}
          >
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--canvas-border)'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  updateUrlParams({ page: newPage });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page <= 1}
                className="btn btn-outline btn-sm"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                Page {page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => {
                  const newPage = Math.min(pagination.totalPages, page + 1);
                  setPage(newPage);
                  updateUrlParams({ page: newPage });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page >= pagination.totalPages}
                className="btn btn-outline btn-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowsePage;
