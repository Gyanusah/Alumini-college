
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


// ============================
// 🌿 Load Environment Variables
// ============================
dotenv.config();


import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import eventRoutes from './routes/events.js';
import connectionRoutes from './routes/connections.js';
import alumniRoutes from './routes/alumni.js';
import statsRoutes from './routes/stats.js';
import connectDB from './config/db.js';
import { scheduleJobCleanup } from './utils/jobCleanup.js';

// ============================
// 🚀 Initialize App
// ============================
const app = express();



app.use(cors())
app.use(express.json());

// ============================
// 💾 Connect to MongoDB
// ============================
connectDB();
console.log('Mongo URI:', process.env.MONGODB_URI);

// ============================
// 🧹 Start Job Cleanup Scheduler
// ============================
scheduleJobCleanup();

// ============================
// 🌐 API Routes
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/stats', statsRoutes);



// Root route for testing
app.get('/', (req, res) => {
    res.send("Hello World from Alumni Backend 🚀");
});

// ============================
// 🚫 404 Route Not Found Handler
// ============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// ============================
// ❌ Global Error Handler
// ============================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    const error = {
        success: false,
        message: err.message || 'Server Error',
    };

    // Validation Error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        error.statusCode = 400;
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `${field} already exists`;
        error.statusCode = 400;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    res.status(error.statusCode || 500).json(error);
});







// ============================
// 🖥 Start Server
// ============================


export default app;
