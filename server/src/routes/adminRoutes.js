import express from 'express';
import {
  getAdminOverview,
  getAllReportsAdmin,
  updateReportStatusAdmin,
  deleteReportAdmin,
  getAllClaimsAdmin
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and administrator role
router.use(requireAuth, requireAdmin);

router.get('/overview', getAdminOverview);
router.get('/reports', getAllReportsAdmin);
router.patch('/reports/:id/status', updateReportStatusAdmin);
router.delete('/reports/:id', deleteReportAdmin);
router.get('/claims', getAllClaimsAdmin);

export default router;
