import express from 'express';
import {
    getAllAlumni,
    getAlumniByBranch,
    getAlumniByCompany,
    getAlumniBySkills,
    getAlumniProfile,
    searchAlumni,
    getRecommendations,
    getMyConnections,
    getPendingRequests,
    getSentRequests,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    deleteConnection,
    getConnectionStats,
    getMentorshipConnectionsController,
    
    updateMentorshipDetails,
    getAlumniStats
} from '../controllers/alumniController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// 🟢 Public routes
router.get('/', getAllAlumni);
router.get('/search', searchAlumni);
router.get('/stats/overview', getAlumniStats);
router.get('/branch/:branch', getAlumniByBranch);
router.get('/company/:company', getAlumniByCompany);
router.get('/skills/:skills', getAlumniBySkills);
router.get('/profile/:id', getAlumniProfile);

// 🔒 Private routes (require authentication)
router.get('/recommendations', protect, getRecommendations);
router.get('/my-connections', protect, getMyConnections);
router.get('/pending-requests', protect, getPendingRequests);
router.get('/sent-requests', protect, getSentRequests);
router.get('/stats', protect, getConnectionStats);
router.get('/mentorship', protect, getMentorshipConnectionsController);

// 🔗 Connection management
router.post('/:id/connect', protect, sendConnectionRequest);
router.put('/connections/:id/accept', protect, acceptConnection);
router.put('/connections/:id/reject', protect, rejectConnection);
router.put('/connections/:id/mentorship', protect, updateMentorshipDetails);
router.delete('/connections/:id', protect, deleteConnection);

export default router;
