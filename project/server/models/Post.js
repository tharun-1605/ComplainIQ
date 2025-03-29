import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    comments: [{
        text: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }],
    likes: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
