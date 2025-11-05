import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    description: String,
    jobType: {
        type: String,
        default: 'Full-time'
    },
    applicationDeadline: {
        type: Date,
        required: true
    },
    applications: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resume: String,
        coverLetter: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true  // This adds createdAt and updatedAt automatically
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
