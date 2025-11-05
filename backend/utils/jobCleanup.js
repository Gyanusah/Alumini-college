import Job from '../models/job.js';

// Function to delete expired jobs
export const deleteExpiredJobs = async () => {
    try {
        const currentDate = new Date();
        
        // Find and delete jobs where applicationDeadline has passed
        const result = await Job.deleteMany({
            applicationDeadline: { $lt: currentDate }
        });

        if (result.deletedCount > 0) {
            console.log(`✅ Deleted ${result.deletedCount} expired job(s)`);
        }

        return result.deletedCount;
    } catch (error) {
        console.error('❌ Error deleting expired jobs:', error);
        return 0;
    }
};

// Schedule cleanup to run daily
export const scheduleJobCleanup = () => {
    // Run immediately on startup
    deleteExpiredJobs();

    // Run every 24 hours (86400000 milliseconds)
    setInterval(() => {
        console.log('🔄 Running scheduled job cleanup...');
        deleteExpiredJobs();
    }, 86400000); // 24 hours

    console.log('⏰ Job cleanup scheduler started - runs every 24 hours');
};
