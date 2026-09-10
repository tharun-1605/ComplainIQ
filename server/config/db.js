import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seedDemoUsers = async () => {
    try {
        const demoUser = await User.findOne({ email: 'user1@gmail.com' });
        if (!demoUser) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            await User.create({
                username: 'user1',
                email: 'user1@gmail.com',
                password: hashedPassword,
                role: 'user',
                bio: 'Civic member dedicated to public improvements.'
            });
            console.log('Seeded demo user: user1@gmail.com / 123456');
        }

        const demoAdmin = await User.findOne({ email: 'admin@gmail.com' });
        if (!demoAdmin) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            await User.create({
                username: 'admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin',
                bio: 'Municipal Complaint Administrator'
            });
            console.log('Seeded demo admin: admin@gmail.com / 123456');
        }
    } catch (err) {
        console.error('Error seeding demo users:', err.message);
    }
};

const connectDB = async () => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL;
    const atlasUri = process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv') 
        ? process.env.MONGODB_URI 
        : (process.env.ATLAS_MONGODB_URI || 'mongodb+srv://Tharun:tharun123@cluster.x8wyt2y.mongodb.net/complient');

    const primaryUri = isProduction 
        ? atlasUri 
        : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complient');

    try {
        await mongoose.connect(primaryUri);
        console.log('MongoDB connected successfully to:', primaryUri.includes('mongodb+srv') ? 'MongoDB Atlas Cloud' : 'Local MongoDB');
        await seedDemoUsers();
    } catch (error) {
        console.error('Primary MongoDB connection error:', error.message);
        if (primaryUri !== 'mongodb://127.0.0.1:27017/complient') {
            console.log('Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/complient)...');
            try {
                await mongoose.connect('mongodb://127.0.0.1:27017/complient');
                console.log('MongoDB connected successfully (Local Fallback)');
                await seedDemoUsers();
                return;
            } catch (fallbackError) {
                console.error('Fallback MongoDB connection error:', fallbackError.message);
            }
        }
        process.exit(1);
    }
};

export default connectDB;
