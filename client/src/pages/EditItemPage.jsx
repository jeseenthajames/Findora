import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, ArrowLeft } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../utils/formatters';
import { Spinner } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const EditItemPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setInitialLoading(true);
        const res = await itemsAPI.getItemById(id);
        const item = res.data?.data;

        if (!item) {
          toast.error('Item not found.');
          navigate('/browse');
          return;
        }

        // Ownership or admin check
        const isOwner = user && item.reporter?._id && String(user.id || user._id) === String(item.reporter._id);
        if (!isOwner && !isAdmin) {
          toast.error('You do not have permission to edit this report.');
          navigate(`/items/${id}`);
          return;
        }

        setTitle(item.title);
        setCategory(item.category);
        setDescription(item.description);
        setLocation(item.location);
        setEventDate(item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '');
        setImageUrl(item.imageUrl || '');
      } catch (err) {
        toast.error(err.message);
        navigate('/browse');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchItem();
  }, [id, user, isAdmin, navigate]);

  const validate = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!description.trim() || description.trim().length < 5) {
      errs.description = 'Description must be at least 5 characters.';
    }
    if (!location.trim() || location.trim().length < 2) {
      errs.location = 'Campus location is required.';
    }
    if (!eventDate) {
      errs.eventDate = 'Event date is required.';
    }
    if (imageUrl.trim()) {
      try {
        new URL(imageUrl.trim());
      } catch {
        errs.imageUrl = 'Please enter a valid web image URL.';
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
      await itemsAPI.updateItem(id, {
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        eventDate: new Date(eventDate).toISOString(),
        imageUrl: imageUrl.trim()
      });

      toast.success('Report updated successfully!');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Spinner size={36} />
        <p style={{ color: 'var(--text-muted)' }}>Loading report data...</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Edit size={20} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Edit Report Details
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editTitle">Title <span className="required">*</span></label>
            <input
              id="editTitle"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editCategory">Category <span className="required">*</span></label>
              <select
                id="editCategory"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editEventDate">Date <span className="required">*</span></label>
              <input
                id="editEventDate"
                type="date"
                className="form-control"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={loading}
              />
              {errors.eventDate && <span className="form-error">{errors.eventDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editLocation">Location <span className="required">*</span></label>
            <input
              id="editLocation"
              type="text"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
              disabled={loading}
              list="edit-locations"
            />
            <datalist id="edit-locations">
              {CAMPUS_LOCATIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDescription">Description <span className="required">*</span></label>
            <textarea
              id="editDescription"
              className="form-control"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              disabled={loading}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editImageUrl">Image URL (Optional)</label>
            <input
              id="editImageUrl"
              type="url"
              className="form-control"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
            {errors.imageUrl && <span className="form-error">{errors.imageUrl}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemPage;
