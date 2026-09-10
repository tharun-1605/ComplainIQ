import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    console.log('Profile image path:', req.file ? req.file.path : 'No file uploaded');
    const { username, email, bio, location } = req.body;
    const password = req.body.password;
    const profileImage = req.file ? req.file.path : null;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] }).exec();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, bio, location, profileImage });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
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
    res.json({ token, user: { id: user._id, username: user.username, email, role: user.role, bio: user.bio, location: user.location } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
