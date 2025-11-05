// import jwt from 'jsonwebtoken';
// import ErrorResponse from '../utils/errorResponse.js';
// import asyncHandler from './async.js';
// import User from '../models/user.js';


// // Protect routes
// exports.protect = asyncHandler(async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     }

//     // Make sure token exists
//     if (!token) {
//         return next(new ErrorResponse('Not authorized to access this route', 401));
//     }

//     try {
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id);
//         next();
//     } catch (err) {
//         return next(new ErrorResponse('Not authorized to access this route', 401));
//     }
// });

// // Grant access to specific roles
// exports.authorize = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return next(
//                 new ErrorResponse(
//                     `User role '${req.user.role}' is not authorized to access this route`,
//                     403
//                 )
//             );
//         }
//         next();
//     };
// };

import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/user.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role '${req.user.role}' is not authorized to access this route`, 403));
        }
        next();
    };
};

// Check if user is verified (except admins)
export const checkVerified = asyncHandler(async (req, res, next) => {
    // Admins are always allowed
    if (req.user.role === 'admin') {
        return next();
    }

    // Check if user is verified
    if (!req.user.isVerified) {
        return next(new ErrorResponse('Your account is pending verification. Please wait for admin approval.', 403));
    }

    next();
});