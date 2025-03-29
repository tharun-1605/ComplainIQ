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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
console.log('MongoDB URI:', process.env.MONGODB_URI || 'Not defined');
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Auth routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await brypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
    } catch (error) {
        console.error('Error creating post:', error); // Log the error for debugging
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

import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Append timestamp to the filename
  }
});

const upload = multer({ storage });

app.post('/api/posts', upload.single('image'), auth, async (req, res) => {
    // Add comments to the post
    try {
        const { title, content } = req.body;
        const post = new Post({
            image: req.file ? req.file.path : null, // Include image URL if available
            title,
            content,
            author: req.user.id,
            image: req.file ? req.file.path : null // Include image URL if available
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/user/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id }).populate('author', 'username');
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

        // Increment the like count
        post.likes += 1;
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

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
