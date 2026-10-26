import express from 'express';
import {
  createClaim,
  getMyClaims,
  getIncomingClaims,
  approveClaim,
  rejectClaim
} from '../controllers/claimController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateClaimCreate } from '../validation/claimValidation.js';

const router = express.Router();

router.post('/:itemId', requireAuth, validateClaimCreate, createClaim);
router.get('/my', requireAuth, getMyClaims);
router.get('/incoming', requireAuth, getIncomingClaims);
router.patch('/:claimId/approve', requireAuth, approveClaim);
router.patch('/:claimId/reject', requireAuth, rejectClaim);

export default router;
