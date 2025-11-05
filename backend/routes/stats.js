import express from 'express';
import { getRecentActivity, getDashboardStats } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/recent-activity', protect, authorize('admin'), getRecentActivity);
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

export default router;
