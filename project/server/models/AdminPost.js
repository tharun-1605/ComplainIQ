import mongoose from 'mongoose';

const adminPostSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  video: {
    type: String,
    required: false,
  },
  repliedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('AdminPost', adminPostSchema);
