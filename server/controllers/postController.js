import Post from '../models/Post.js';
import AdminPost from '../models/AdminPost.js';

export const createPost = async (req, res) => {
  console.log('Incoming request body:', req.body);
  const { title, content, image, video, latitude, longitude, category } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const post = new Post({
      title: title || 'Civic Complaint',
      content,
      image,
      video,
      latitude,
      longitude,
      category: category || 'Others',
      author: req.user.id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getAllUserPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username name email avatar')
      .populate('comments.author', 'username name avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'username name email avatar')
      .populate('comments.author', 'username name avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    console.log(`Liking post ID: ${postId} by user ${req.user?.id}`);

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    )
      .populate('author', 'username name email avatar')
      .populate('comments.author', 'username name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { comment } = req.body;
    console.log(`Adding comment to post ID ${postId}:`, comment);

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const newComment = {
      text: comment.trim(),
      author: req.user.id,
      createdAt: new Date()
    };

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    ).populate('comments.author', 'username name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Extract the added comment with populated author details
    const addedComment = post.comments[post.comments.length - 1];
    res.status(200).json(addedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const updateStatus = async (req, res) => {
  console.log('Received PUT request for complaint ID:', req.params.complaintId);
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const updatedComplaint = await Post.updateStatus(complaintId, status);
    if (!updatedComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getCompletedComplaints = async (req, res) => {
  try {
    const completedComplaints = await Post.find({ status: 'Completed' })
      .populate('author', 'username name email avatar')
      .lean();

    const complaintsWithAdminReply = await Promise.all(
      completedComplaints.map(async (complaint) => {
        const adminReply = await AdminPost.findOne({ postId: complaint._id.toString() }).lean();
        return {
          ...complaint,
          adminReply: adminReply || null,
        };
      })
    );

    res.json(complaintsWithAdminReply);
  } catch (error) {
    console.error('Error fetching completed complaints:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

