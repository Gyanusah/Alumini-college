// import express from 'express';
// import { check, validationResult } from 'express-validator';
// import {
//     register,
//     login,
//     getMe,
//     forgotPassword,
//     resetPassword,
//     updateDetails,
//     updatePassword
// } from '../controllers/authController.js';

// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // Middleware to handle validation errors
// const handleValidationErrors = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             success: false,
//             message: errors.array()[0].msg
//         });
//     }
//     next();
// };

// router.post(
//     '/register',
//     [
//         check('name', 'Name is required').not().isEmpty(),
//         check('email', 'Please include a valid email').isEmail(),
//         check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
//         check('role', 'Please select a valid role').isIn(['student', 'alumni']),
//         check('branch', 'Branch is required').not().isEmpty(),
//         check('graduationYear', 'Graduation year is required').isNumeric()
//     ],
//     handleValidationErrors,
//     register
// );

// router.post(
//     '/login',
//     [
//         check('email', 'Please include a valid email').isEmail(),
//         check('password', 'Password is required').exists()
//     ],
//     handleValidationErrors,
//     login
// );

// router.get('/me', protect, getMe);
// router.put('/updatedetails', protect, updateDetails);
// router.put('/updatepassword', protect, updatePassword);
// router.post('/forgotpassword', forgotPassword);
// router.put('/resetpassword/:resettoken', resetPassword);

// export default router;

import express from 'express';
import {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;
