import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    image: {
        type: String, // Change to Mixed type for GridFS
        required: false
    },
    video: { // Change to Mixed type for GridFS
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
    },
    status: { // Adding status field
        type: String,
        enum: ['Pending', 'Resolved', 'Rejected', 'Completed'], // Possible statuses
        default: 'Pending' // Default status
    }
}, { timestamps: true });

postSchema.statics.updateStatus = async function(complaintId, newStatus) {
    return await this.findByIdAndUpdate(complaintId, { status: newStatus }, { new: true });
};

export default mongoose.model('Post', postSchema);
