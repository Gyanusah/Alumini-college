import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const createAdmin = async () => {
    try {
        // Get admin credentials from environment variables or use defaults
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@alumni.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminName = process.env.ADMIN_NAME || 'Admin User';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('❌ Admin user already exists');
            console.log('ℹ️  Use the existing admin credentials to login');
            console.log('🔗 Login at: http://localhost:5173/login');
            console.log('📊 Admin Dashboard: http://localhost:5173/admin-dashboard');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            branch: 'Administration',
            graduationYear: new Date().getFullYear(),
            isVerified: true,
            bio: 'System Administrator'
        });

        console.log('✅ Admin user created successfully!');
        console.log('ℹ️  Admin credentials have been set');
        console.log('🔗 Login at: http://localhost:5173/login');
        console.log('📊 Admin Dashboard: http://localhost:5173/admin-dashboard');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the default password after first login!');
        console.log('💡 TIP: Set ADMIN_EMAIL and ADMIN_PASSWORD in .env for custom credentials');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
