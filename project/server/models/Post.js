import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    image: {
        type: String, // Change to Mixed type for GridFS
        required: false
    },
    video: {
        type: mongoose.Schema.Types.Mixed, // Changed to Mixed type for better handling
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
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    status: { // Adding status field
        type: String,
        enum: ['Pending', 'Resolved', 'Rejected', 'Completed'], // Possible statuses
        default: 'Pending' // Default status
    },
    category: {
        type: String,
        enum: ['Electric', 'Water', 'Social Problem', 'Drainage', 'Air', 'Others'],
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
