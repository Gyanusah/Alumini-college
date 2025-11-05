import express from 'express';
import {
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    registerEvent,
    approveEvent
} from '../controllers/eventController.js';

import { protect, authorize, checkVerified } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', protect, checkVerified, createEvent);
router.put('/:id', protect, checkVerified, updateEvent);
router.delete('/:eventid', protect, checkVerified, deleteEvent);
router.post('/:id/register', protect, checkVerified, registerEvent);
router.put('/:id/approve', protect, authorize('admin'), approveEvent);

export default router;
