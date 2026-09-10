import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    video: {
        type: mongoose.Schema.Types.Mixed,
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
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    likes: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
        required: false,
        default: 'Civic Complaint'
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    category: {
        type: String,
        default: 'Others'
    }
}, { timestamps: true });

postSchema.statics.updateStatus = async function(complaintId, newStatus) {
    return await this.findByIdAndUpdate(complaintId, { status: newStatus }, { new: true });
};

postSchema.statics.deletePost = async function(postId) {
    return await this.findByIdAndDelete(postId);
};

export default mongoose.model('Post', postSchema);

