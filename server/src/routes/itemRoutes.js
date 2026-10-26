import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  resolveItem,
  deleteItem,
  getMyItems,
  getStats
} from '../controllers/itemController.js';
import { getPotentialMatches } from '../controllers/matchController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { validateItemCreate, validateItemUpdate } from '../validation/itemValidation.js';

const router = express.Router();

// Statistics route (before :id to avoid route clash)
router.get('/stats', getStats);

// User's own items
router.get('/my', requireAuth, getMyItems);

// Potential matching suggestions
router.get('/:id/matches', optionalAuth, getPotentialMatches);

// Standard item CRUD
router.get('/', optionalAuth, getItems);
router.get('/:id', optionalAuth, getItemById);
router.post('/', requireAuth, validateItemCreate, createItem);
router.put('/:id', requireAuth, validateItemUpdate, updateItem);
router.patch('/:id/resolve', requireAuth, resolveItem);
router.delete('/:id', requireAuth, deleteItem);

export default router;
