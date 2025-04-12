import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import auth from './middleware/auth.js';
import multer from 'multer';
import { MongoClient, GridFSBucket } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
console.log('MongoDB URI:', process.env.MONGODB_URI || 'Not defined');
const app = express();
app.use(cors());
app.use(express.static('src')); // Serve static files from the src directory
app.use(express.static('uploads')); // Serve static files from the uploads directory
app.use(express.json({ limit: '10mb' }));


// Connect to MongoDB
connectDB();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Append timestamp to the filename
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Increase limit to 10MB
});

// Auth routes
app.post('/api/register', upload.single('profileImage'), async (req, res) => {
    try {
console.log('Received registration data:', req.body); // Log the incoming data
console.log('Profile image path:', req.file ? req.file.path : 'No file uploaded'); // Log the profile image path
        const { username, email, bio } = req.body;
        const password = req.body.password; // Access password from req.body
        const profileImage = req.file ? req.file.path : null; // Handle profile image

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] }).exec();
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, bio, profileImage }); // Include bio and profileImage
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
    } catch (error) {
        console.error('Error creating user:', error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, username: user.username, email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected routes
app.get('/api/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log('User profile fetched:', user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Duplicate multer configuration removed

app.post('/api/posts', auth, async (req, res) => {
    console.log('Incoming request body:', req.body);
    const { title, content, image, video } = req.body; // Include video in the destructured body
  
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
  
    try {
      const post = new Post({
        title,
        content,
        image,
        video, // base64 string
        author: req.user.id,
      });
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

app.get('/api/user/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').populate('comments.author', 'username');
        console.log('Posts retrieved:', posts); // Log the retrieved posts
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id })
            .populate('author', 'username')
            .populate('comments.author', 'username'); // Populate comments to include author information
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts/:postId/like', auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const user = await User.findById(req.user.id);
        
        if (user.likedPosts.includes(postId)) {
            return res.status(400).json({ message: 'You have already liked this post.' });
        }

        // Add postId to user's likedPosts and increment the like count
        user.likedPosts.push(postId);
        post.likes += 1;

        await user.save();
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts/:postId/comment', auth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const { comment } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({ text: comment, author: req.user.id });
        await post.save();
        res.status(200).json({ message: 'Comment added', comment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/user/complaints/:complaintId/status', auth, async (req, res) => {
    console.log('Received PUT request for complaint ID:', req.params.complaintId);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id); // Log the authenticated user ID
    console.log('Received PUT request for complaint ID:', req.params.complaintId);
    console.log('Request body:', req.body);
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
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/posts/:postId', auth, async (req, res) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
        console.log(`Post with ID ${postId} not found in DB`);
        return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
