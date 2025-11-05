import express from 'express';
import {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyJob
} from '../controllers/jobController.js';

import { protect, authorize, checkVerified } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJob);
router.post('/', protect, checkVerified, authorize('alumni', 'admin'), createJob);
router.put('/:id', protect, checkVerified, updateJob);
router.delete('/:id', protect, checkVerified, deleteJob);
router.post('/:id/apply', protect, checkVerified, authorize('student'), applyJob);

export default router;
