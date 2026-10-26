import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, MapPin, Calendar, Tag, ArrowLeft, Info } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../utils/formatters';
import { Spinner } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const ReportFoundPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!category) {
      errs.category = 'Please select an item category.';
    }
    if (!description.trim() || description.trim().length < 5) {
      errs.description = 'Please describe where and how the item was found (minimum 5 characters).';
    }
    if (!location.trim() || location.trim().length < 2) {
      errs.location = 'Please specify where this item was found on campus.';
    }
    if (!eventDate) {
      errs.eventDate = 'Please specify the date found.';
    }
    if (imageUrl.trim()) {
      try {
        new URL(imageUrl.trim());
      } catch {
        errs.imageUrl = 'Please enter a valid web image URL (e.g. starting with https://).';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await itemsAPI.createItem({
        title: title.trim(),
        category,
        description: description.trim(),
        reportType: 'found',
        location: location.trim(),
        eventDate: new Date(eventDate).toISOString(),
        imageUrl: imageUrl.trim()
      });

      toast.success('Found item report published successfully!');
      navigate(`/items/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '580px' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--found-bg)',
              color: 'var(--found-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <PlusCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
            Sign In to Register a Found Item
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            To allow the rightful owner to submit a claim and communicate with you to arrange a safe campus handover, please sign in.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-primary">
              Sign In to Continue
            </Link>
            <Link to="/register" className="btn btn-outline">
              Register Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '720px' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-outline btn-sm"
        style={{ gap: '0.35rem', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="card" style={{ padding: '2rem 2.5rem', border: '1px solid var(--canvas-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--found-bg)',
              color: 'var(--found-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlusCircle size={22} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Register a Found Item
          </h1>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          Thank you for being a good citizen of the campus community! Fill in the item details below so the owner can recognize their belonging.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Item Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Item Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-control"
              placeholder="e.g. Found Earbuds in Case, Car & Dorm Keys, Calculus Spiral Notebook..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              {errors.title ? <span className="form-error">{errors.title}</span> : <span className="form-helper">Keep title clear and descriptive</span>}
              <span className="form-helper">{title.length} / 100</span>
            </div>
          </div>

          {/* Category & Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="eventDate">
                Date Discovered / Found <span className="required">*</span>
              </label>
              <input
                id="eventDate"
                type="date"
                className="form-control"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
              {errors.eventDate && <p className="form-error">{errors.eventDate}</p>}
            </div>
          </div>

          {/* Campus Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Campus Location Discovered <span className="required">*</span>
            </label>
            <input
              id="location"
              type="text"
              className="form-control"
              placeholder="e.g. Science Complex Room 204 benches, Dining Commons Courtyard..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
              disabled={loading}
              list="location-options-found"
            />
            <datalist id="location-options-found">
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
            {errors.location ? (
              <span className="form-error">{errors.location}</span>
            ) : (
              <span className="form-helper">Exact room number, bench, or building area</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              General Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              className="form-control"
              rows={4}
              placeholder="Describe color, type, condition, or general appearance. (Tip: omit confidential details such as codes or exact cash amounts so claimants must prove ownership!)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              disabled={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              {errors.description ? (
                <span className="form-error">{errors.description}</span>
              ) : (
                <span className="form-helper">Minimum 5 characters</span>
              )}
              <span className="form-helper">{description.length} / 1000</span>
            </div>
          </div>

          {/* Public Image URL (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="imageUrl">
              Public Image URL (Optional)
            </label>
            <input
              id="imageUrl"
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/... or web image link"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
            {errors.imageUrl ? (
              <span className="form-error">{errors.imageUrl}</span>
            ) : (
              <span className="form-helper">Optional photo of the found item</span>
            )}

            {/* Live Preview */}
            {imageUrl.trim() && !errors.imageUrl && (
              <div
                style={{
                  marginTop: '0.75rem',
                  height: '140px',
                  width: '200px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--canvas-border)',
                  backgroundColor: '#f1f5f9'
                }}
              >
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Campus Office Advisory */}
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              marginBottom: '1.75rem',
              fontSize: '0.8125rem',
              color: '#0f766e',
              lineHeight: 1.45
            }}
          >
            <Info size={18} style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Campus Safety Recommendation:</strong> For high-value items (laptops, phones, jewelry, wallets with money), consider depositing them with the Central Campus Lost &amp; Found Office in the Student Union, Room 114.
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading && <Spinner size={16} color="#ffffff" />}
              Publish Found Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFoundPage;
