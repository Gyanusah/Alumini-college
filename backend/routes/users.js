import express from 'express';
import { getAllUsers, getUser,
     updateUser, deleteUser, 
     getAllAlumni,
    searchUsers
     } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', getAllUsers);
router.get('/alumni', getAllAlumni);
router.get('/search', searchUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
