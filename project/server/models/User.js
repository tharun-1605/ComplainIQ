import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: { // Field for profile photo
        type: String,
        required: false // Optional field
    },
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        unique: true // Ensure a user can only like a post once
    }],
    totalLikes: { // Existing field for total likes
        type: Number,
        default: 0 // Initialize to 0
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
