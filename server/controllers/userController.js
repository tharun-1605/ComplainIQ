import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user && !user.bio) {
      user.bio = 'No bio available';
    }
    console.log('User profile fetched:', user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, bio, location } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username !== undefined) {
      user.username = username;
    }
    if (email !== undefined) {
      user.email = email;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (location !== undefined) {
      user.location = location;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
