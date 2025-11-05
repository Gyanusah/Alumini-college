

import User from '../models/user.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// Get all users
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
});

// Get single user
export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }
    res.status(200).json({ success: true, data: user });
});

// Update user
export const updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({ success: true, data: user });
});

// ✅ Add this new deleteUser function
export const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
});

export const getAllAlumni = asyncHandler(async (req, res, next) => {
    const alumni = await User.find({ role: "alumni" }).select("-password");

    res.status(200).json({
        success: true,
        count: alumni.length,
        data: alumni,
    });
});

// ✅ Search users by name, email, or company
export const searchUsers = asyncHandler(async (req, res, next) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        return next(new ErrorResponse("Please provide a search query", 400));
    }

    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { currentCompany: { $regex: query, $options: "i" } },
        ],
    }).select("-password");

    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});

// @desc    Verify user (Admin only)
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
export const verifyUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Check if user is alumni and validate graduation year
    if (user.role === 'alumni') {
        const currentYear = new Date().getFullYear();
        
        // Alumni must have graduated in a previous year
        if (user.graduationYear >= currentYear) {
            return next(
                new ErrorResponse(
                    `Cannot verify as alumni. Graduation year must be before ${currentYear}. Current students should have student role.`,
                    400
                )
            );
        }
    }

    // Verify the user
    user.isVerified = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User verified successfully',
        data: user
    });
});

// @desc    Unverify user (Admin only)
// @route   PUT /api/users/:id/unverify
// @access  Private/Admin
export const unverifyUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    user.isVerified = false;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User unverified successfully',
        data: user
    });
});

// @desc    Create new admin user (Admin only)
// @route   POST /api/users/create-admin
// @access  Private/Admin
export const createAdminUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, branch, graduationYear } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return next(new ErrorResponse('Please provide name, email, and password', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('User with this email already exists', 400));
    }

    // Create admin user
    const adminUser = await User.create({
        name,
        email,
        password,
        role: 'admin',
        branch: branch || 'Administration',
        graduationYear: graduationYear || new Date().getFullYear(),
        isVerified: true,
        bio: 'Administrator'
    });

    res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        data: {
            _id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
        }
    });
});

