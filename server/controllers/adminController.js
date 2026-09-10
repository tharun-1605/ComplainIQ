import AdminPost from '../models/AdminPost.js';
import Post from '../models/Post.js';

export const replyToPost = async (req, res) => {
  console.log('Received admin reply request for postId:', req.params.postId);

  try {
    const { postId } = req.params;
    const adminId = req.user.id;
    const { description, image, video } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Resolution description is required' });
    }

    const newAdminPost = new AdminPost({
      postId,
      adminId,
      description: description.trim(),
      image: image || null,
      video: video || null,
    });

    await newAdminPost.save();

    // Mark post status as Completed so it appears in Completed Complaints showcase
    await Post.findByIdAndUpdate(postId, { status: 'Completed' });

    res.status(201).json({ message: 'Admin reply posted successfully', adminPost: newAdminPost });
  } catch (error) {
    console.error('Error posting admin reply:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

