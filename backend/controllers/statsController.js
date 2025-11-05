import asyncHandler from '../middleware/async.js';
import User from '../models/user.js';
import Job from '../models/job.js';
import Event from '../models/event.js';

// @desc    Get recent activity stats
// @route   GET /api/stats/recent-activity
// @access  Private/Admin
export const getRecentActivity = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get new users registered today
    const newUsersToday = await User.countDocuments({
        createdAt: { $gte: today }
    });

    // Get new job postings created today
    const newJobsToday = await Job.countDocuments({
        createdAt: { $gte: today }
    });

    // Get pending events (not approved yet)
    const pendingEvents = await Event.countDocuments({
        isApproved: false
    });

    // Get recent users (last 5)
    const recentUsers = await User.find()
        .select('name email role createdAt')
        .sort('-createdAt')
        .limit(5);

    // Get recent jobs (last 5)
    const recentJobs = await Job.find()
        .select('title company createdAt')
        .populate('postedBy', 'name')
        .sort('-createdAt')
        .limit(5);

    // Get recent events (last 5)
    const recentEvents = await Event.find()
        .select('title location isApproved createdAt')
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .limit(5);

    res.status(200).json({
        success: true,
        data: {
            stats: {
                newUsersToday,
                newJobsToday,
                pendingEvents
            },
            recentUsers,
            recentJobs,
            recentEvents
        }
    });
});

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalJobs = await Job.countDocuments();
    const totalEvents = await Event.countDocuments();
    const pendingVerifications = await User.countDocuments({ isVerified: false, role: { $ne: 'admin' } });

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalAlumni,
            totalStudents,
            totalJobs,
            totalEvents,
            pendingVerifications
        }
    });
});
