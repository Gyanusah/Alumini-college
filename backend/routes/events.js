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

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:eventid', protect, deleteEvent);
router.post('/:id/register', protect, registerEvent);
router.put('/:id/approve', protect, authorize('admin'), approveEvent);

export default router;
