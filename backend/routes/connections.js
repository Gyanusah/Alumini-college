// import express from 'express';
// import {
//     getConnections,
//     getPendingRequests,
//     sendConnectionRequest,
//     acceptConnection,
//     rejectConnection,
//     deleteConnection
// } from '../controllers/connectionController.js';




// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// router.get('/', protect, getConnections);
// router.get('/pending', protect, getPendingRequests);
// router.post('/', protect, sendConnectionRequest);
// router.put('/:id/accept', protect, acceptConnection);
// router.put('/:id/reject', protect, rejectConnection);
// router.delete('/:id', protect, deleteConnection);

// export default router;


import express from 'express';
import {
    getConnections,
    getPendingRequests,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    deleteConnection
} from '../controllers/connectionController.js';
import { protect, checkVerified } from '../middleware/auth.js';

const router = express.Router();

// ===== Connection Routes =====
// Allow viewing connections and pending requests even if unverified
router.get('/', protect, getConnections);
router.get('/pending', protect, getPendingRequests);
// Require verification for sending, accepting, rejecting connections
router.post('/', protect, checkVerified, sendConnectionRequest);
router.put('/:id/accept', protect, checkVerified, acceptConnection);
router.put('/:id/reject', protect, checkVerified, rejectConnection);
router.delete('/:id', protect, checkVerified, deleteConnection);

export default router;
