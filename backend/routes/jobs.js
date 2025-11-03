import express from 'express';
import {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyJob
} from '../controllers/jobController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('alumni', 'admin'), createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, authorize('student'), applyJob);

export default router;
