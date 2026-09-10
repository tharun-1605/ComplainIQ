import AdminPost from '../models/AdminPost.js';

export const replyToPost = async (req, res) => {
  console.log('Received admin reply request');
  console.log('Request params:', req.params);
  console.log('Request user:', req.user);
  console.log('Request body:', req.body);

  try {
    const { postId } = req.params;
    const adminId = req.user.id;
    const { description, image, video } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const newAdminPost = new AdminPost({
      postId,
      adminId,
      description,
      image: image || null,
      video: video || null,
    });

    await newAdminPost.save();

    res.status(201).json({ message: 'Admin reply posted successfully', adminPost: newAdminPost });
  } catch (error) {
    console.error('Error posting admin reply:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};
