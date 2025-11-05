import express from 'express';
import { getAllUsers, getUser,
     updateUser, deleteUser, 
     getAllAlumni,
    searchUsers,
    verifyUser,
    unverifyUser,
    createAdminUser
     } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', getAllUsers);
router.get('/alumni', getAllAlumni);
router.get('/search', searchUsers);
router.post('/create-admin', protect, authorize('admin'), createAdminUser);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.put('/:id/verify', protect, authorize('admin'), verifyUser);
router.put('/:id/unverify', protect, authorize('admin'), unverifyUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
