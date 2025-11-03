import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an event title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    eventType: {
        type: String,
        enum: ['workshop', 'seminar', 'conference', 'reunion', 'networking', 'other'],
        required: true
    },
    // startDate: {
    //     type: Date,
    //     required: [true, 'Please add a start date']
    // },
    // endDate: {
    //     type: Date,
    //     required: [true, 'Please add an end date']
    // },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    isVirtual: {
        type: Boolean,
        default: false
    },
    meetingLink: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: 'default-event.jpg'
    },
    maxAttendees: {
        type: Number,
        default: 0
    },
    attendees: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['registered', 'attended', 'cancelled'],
            default: 'registered'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for search functionality
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Event = mongoose.model('Event', eventSchema);
export default Event;
