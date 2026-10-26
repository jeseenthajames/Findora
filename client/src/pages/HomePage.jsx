import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Compass,
  FileQuestion,
  Layers,
  Inbox
} from 'lucide-react';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import StatCard from '../components/StatCard';
import { CardSkeletonGrid } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../utils/formatters';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [statsRes, itemsRes] = await Promise.all([
          itemsAPI.getStats(),
          itemsAPI.getItems({ limit: 6, sortBy: 'newest' })
        ]);

        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (itemsRes.data?.data) {
          setRecentItems(itemsRes.data.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load campus reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f5f3ee 0%, var(--canvas-bg) 100%)',
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem',
          borderBottom: '1px solid var(--canvas-border)'
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px' }}>
          {/* Top Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--teal-50)',
              border: '1px solid var(--teal-200)',
              color: 'var(--teal-800)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.5rem'
            }}
          >
            <Compass size={15} />
            Official Campus Lost &amp; Found Directory
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: 'var(--navy-900)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}
          >
            Lost something on campus?
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2.25rem auto'
            }}
          >
            Findora connects students and campus staff to recover misplaced IDs, keys, electronics, water bottles, and textbooks through verified reports and rule-based candidate matching.
          </p>

          {/* Prominent Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '2px solid var(--canvas-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.5rem 0.35rem 1.25rem',
              boxShadow: 'var(--shadow-md)',
              maxWidth: '620px',
              margin: '0 auto 2rem auto',
              transition: 'border-color 0.2s ease'
            }}
          >
            <Search size={20} style={{ color: 'var(--teal-700)', flexShrink: 0, marginRight: '0.75rem' }} />
            <input
              type="text"
              placeholder="Search by item name, location, or brand (e.g. 'Apple Watch', 'Library')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                backgroundColor: 'transparent',
                color: 'var(--navy-900)'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.5rem' }}
            >
              Search
            </button>
          </form>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <Link
              to="/report-lost"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: 'var(--navy-900)',
                color: '#ffffff',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <FileQuestion size={18} style={{ color: 'var(--lost-red)' }} />
              Report a Lost Item
            </Link>
            <Link
              to="/report-found"
              className="btn btn-primary btn-lg"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <PlusCircle size={18} />
              Report a Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* Real Statistics Section */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          <StatCard
            title="Total Campus Reports"
            value={stats ? stats.totalReports : 0}
            icon={Layers}
            color="#1d2d5a"
            subtitle="Registered lost & found cases"
          />
          <StatCard
            title="Active Open Items"
            value={stats ? stats.openReports : 0}
            icon={Clock}
            color="#0f766e"
            subtitle="Awaiting claims or identification"
          />
          <StatCard
            title="Items Reunited"
            value={stats ? stats.resolvedReports : 0}
            icon={CheckCircle}
            color="#059669"
            subtitle="Successfully returned to owners"
          />
          <StatCard
            title="Active Claims Under Review"
            value={stats ? stats.pendingClaimsCount : 0}
            icon={ShieldCheck}
            color="#d97706"
            subtitle="Verified ownership requests"
          />
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              Explore by Category
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Quickly find belongings sorted by campus department and item type
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
            gap: '0.875rem'
          }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/browse?category=${encodeURIComponent(cat)}`}
              className="card card-hover"
              style={{
                padding: '1rem 0.75rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                border: '1px solid var(--canvas-border)'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal-50)',
                  color: 'var(--teal-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Tag size={18} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy-900)', lineHeight: 1.25 }}>
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Lost & Found Reports */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              Recent Campus Reports
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Latest items reported lost or discovered around university grounds
            </p>
          </div>

          <Link to="/browse" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
            View All Reports
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : error ? (
          <EmptyState
            title="Unable to load reports"
            message={error}
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        ) : recentItems.length === 0 ? (
          <EmptyState
            title="No reports registered yet"
            message="Be the first to publish a lost or found report to help the campus community."
            actionLabel="Report Lost Item"
            actionLink="/report-lost"
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* How Findora Works (3 Steps) */}
      <section
        style={{
          backgroundColor: 'var(--canvas-card)',
          borderTop: '1px solid var(--canvas-border)',
          borderBottom: '1px solid var(--canvas-border)',
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem'
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            How Findora Works
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 3rem auto' }}>
            A transparent, student-first workflow designed to return belongings safely while safeguarding personal privacy.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
              textAlign: 'left'
            }}
          >
            {/* Step 1 */}
            <div
              className="card"
              style={{ padding: '2rem 1.5rem', border: '1px solid var(--canvas-border)', position: 'relative' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--navy-900)',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Publish a Report
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Submit key details including campus location, date, category, and an optional photo. Personal contact information remains private.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="card"
              style={{ padding: '2rem 1.5rem', border: '1px solid var(--canvas-border)', position: 'relative' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-700)',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Rule-Based Candidate Matching
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Our explainable algorithm compares keywords, category, and date proximity to suggest candidate matches with transparent scoring.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="card"
              style={{ padding: '2rem 1.5rem', border: '1px solid var(--canvas-border)', position: 'relative' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--found-green)',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Verify &amp; Reclaim
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Submit proof of ownership through a claim request. The finder reviews the proof, approves the return, and marks the item resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Found something left behind on campus?
            </h2>
            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
              Help your fellow student or faculty colleague get their belongings back. Registering a found item takes less than a minute.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/report-found" className="btn btn-primary btn-lg" style={{ backgroundColor: 'var(--teal-600)' }}>
                <PlusCircle size={18} />
                Register a Found Item Now
              </Link>
              <Link to="/browse" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: '#475569' }}>
                Browse All Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
