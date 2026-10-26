import { ITEM_CATEGORIES, REPORT_TYPES } from '../models/ItemReport.js';

export const validateItemCreate = (req, res, next) => {
  const { title, category, description, reportType, location, eventDate, imageUrl } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters.');
  }

  if (!category || !ITEM_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${ITEM_CATEGORIES.join(', ')}`);
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    errors.push('Description must be at least 5 characters.');
  }

  if (!reportType || !REPORT_TYPES.includes(reportType)) {
    errors.push("Report type must be either 'lost' or 'found'.");
  }

  if (!location || typeof location !== 'string' || location.trim().length < 2) {
    errors.push('Campus location is required.');
  }

  if (!eventDate || isNaN(Date.parse(eventDate))) {
    errors.push('A valid event date is required.');
  }

  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    try {
      new URL(imageUrl);
    } catch {
      errors.push('Image URL must be a valid web URL or empty.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' '),
      errors
    });
  }

  next();
};

export const validateItemUpdate = (req, res, next) => {
  const { title, category, description, location, eventDate, imageUrl } = req.body;
  const errors = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
    errors.push('Title must be at least 3 characters.');
  }

  if (category !== undefined && !ITEM_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${ITEM_CATEGORIES.join(', ')}`);
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length < 5)) {
    errors.push('Description must be at least 5 characters.');
  }

  if (location !== undefined && (typeof location !== 'string' || location.trim().length < 2)) {
    errors.push('Campus location is required.');
  }

  if (eventDate !== undefined && isNaN(Date.parse(eventDate))) {
    errors.push('A valid event date is required.');
  }

  if (imageUrl !== undefined && typeof imageUrl === 'string' && imageUrl.trim()) {
    try {
      new URL(imageUrl);
    } catch {
      errors.push('Image URL must be a valid web URL or empty.');
    }
  }

  // Prevent users from tampering with protected system fields via update
  delete req.body.reporter;
  delete req.body.reportType;
  delete req.body._id;

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' '),
      errors
    });
  }

  next();
};
