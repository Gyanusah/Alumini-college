import mongoose from 'mongoose';


const connectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot be longer than 500 characters']
    },
    mentorshipRequest: {
        type: Boolean,
        default: false
    },
    mentorshipDetails: {
        goals: [String],
        preferredCommunication: {
            type: String,
            enum: ['email', 'chat', 'video_call', 'in_person'],
            default: 'chat'
        },
        availability: String,
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'cancelled'],
            default: 'pending'
        },
        startDate: Date,
        endDate: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can only send one connection request to another user
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Update the updatedAt field before saving
connectionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Connection', connectionSchema);

