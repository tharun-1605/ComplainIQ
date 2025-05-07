import React, { useEffect, useState } from 'react';
import { auth } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { posts } from '../services/api'; // Import posts service
import { motion, AnimatePresence } from 'framer-motion';

function ProfileUpdated() {
  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: 'path/to/default/avatar.png', // Default avatar
    bio: 'No bio available', // Default bio
    location: null,
    joinedDate: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile();
        setProfile({
          name: response.data.username || 'Unknown',
          email: response.data.email,
          avatar: response.data.avatar || 'path/to/default/avatar.png',
          bio: response.data.bio || 'No bio available',
          location: response.data.location || null,
          joinedDate: response.data.createdAt || null,
        });
        setEditedProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://public-complient-websitw.onrender.com/api/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (Array.isArray(response.data)) {
          setUserPosts(response.data);
        } else {
          setUserPosts([]);
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };
    fetchUserPosts();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await auth.updateProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to save profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeletePost = async (postId) => {
    try {
      await posts.delete(postId);
      setUserPosts(userPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error?.response?.data || error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-black-100 flex flex-col items-center p-4">
      <motion.div 
        className="w-full max-w-4xl bg-gray-900 shadow-lg rounded-lg p-6 mt-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <img
              src={profile.avatar} // Fallback image
              alt="Avatar"
              className="w-28 h-28 rounded-full border-4 border-pink-500 shadow-md"
            />
          </motion.div>
          <motion.h2 
            className="text-2xl font-semibold mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {profile.name}
          </motion.h2>
          <motion.p 
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {profile.email}
          </motion.p>
          <motion.p 
            className="text-gray-300 mt-2 text-center max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {profile.bio}
          </motion.p>
          <motion.div 
            className="flex space-x-4 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
            >
              Edit Profile
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
            >
              Logout
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="w-full max-w-4xl mt-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <h2 className="text-xl font-semibold mb-4 text-white">Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <motion.div
                  key={post._id}
                  className="bg-gray-800 shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-pink-500/50 transition-shadow duration-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  {post.image && <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />}
                  {post.video && (
                    <video controls className="w-full h-48 object-cover">
                      <source src={post.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                    <p className="text-gray-400 mt-2">
                      <strong>Status:</strong> {post.status || 'Pending'}
                    </p>
                    <div className="mt-3 flex items-center space-x-4">
                      <p className="text-pink-400 font-semibold">❤️ {post.likes} Likes</p>
                      <button 
                        onClick={() => handleDeletePost(post._id)} 
                        className="px-4 py-2 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-white font-semibold">Comments:</h4>
                      <div className="mt-2 max-h-24 overflow-y-auto border rounded p-2 bg-gray-900">
                        {post.comments.length > 0 ? (
                          post.comments.map((comment, index) => (
                            <div key={index} className="text-gray-300 border-b py-1">
                              <strong>{comment.user}</strong>: {comment.text}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No comments yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-white">No posts available.</p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfileUpdated;
