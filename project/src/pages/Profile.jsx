import React, { useEffect, useState } from 'react';
import { auth } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { posts } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiLogOut, FiTrash2, FiHeart, FiMessageSquare, FiUser, FiMail, FiMapPin, FiCalendar } from 'react-icons/fi';

function ProfileUpdated() {
  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80',
    bio: 'No bio available',
    location: null,
    joinedDate: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile();
        setProfile({
          name: response.data.username || 'Unknown',
          email: response.data.email,
          avatar: response.data.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80',
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

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
      />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Profile Header */}
      <motion.div 
        className="relative bg-gradient-to-r from-purple-900 to-pink-800 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="relative -mt-20 md:mt-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 bg-pink-600 rounded-full p-2 hover:bg-pink-700 transition-all duration-300 shadow-lg"
              >
                <FiEdit className="text-white" />
              </button>
            </motion.div>

            <div className="md:ml-8 mt-6 md:mt-0 text-center md:text-left">
              <motion.h1 
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {profile.name}
              </motion.h1>
              <motion.p 
                className="text-gray-300 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {profile.bio}
              </motion.p>

              <motion.div 
                className="flex flex-wrap justify-center md:justify-start gap-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center text-sm bg-gray-800 bg-opacity-50 px-4 py-2 rounded-full">
                  <FiMail className="mr-2 text-pink-400" />
                  <span>{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center text-sm bg-gray-800 bg-opacity-50 px-4 py-2 rounded-full">
                    <FiMapPin className="mr-2 text-pink-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.joinedDate && (
                  <div className="flex items-center text-sm bg-gray-800 bg-opacity-50 px-4 py-2 rounded-full">
                    <FiCalendar className="mr-2 text-pink-400" />
                    <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div 
              className="mt-6 md:mt-0 md:ml-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button 
                onClick={handleLogout} 
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 shadow-lg"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-medium ${activeTab === 'posts' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-3 font-medium ${activeTab === 'liked' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
          >
            Liked Posts
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 font-medium ${activeTab === 'saved' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
          >
            Saved Posts
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FiUser className="mr-2 text-pink-500" />
                My Posts
              </h2>
              
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {userPosts.map((post) => (
                      <motion.div
                        key={post._id}
                        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                        layout
                      >
                        {post.image && (
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                            />
                          </div>
                        )}
                        {post.video && (
                          <div className="h-48 overflow-hidden">
                            <video 
                              controls 
                              className="w-full h-full object-cover"
                              poster={post.image}
                            >
                              <source src={post.video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.status === 'approved' ? 'bg-green-900 text-green-300' :
                              post.status === 'rejected' ? 'bg-red-900 text-red-300' :
                              'bg-yellow-900 text-yellow-300'
                            }`}>
                              {post.status || 'pending'}
                            </span>
                          </div>
                          <p className="text-gray-300 line-clamp-2">{post.content}</p>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-pink-400">
                                <FiHeart className="mr-1" />
                                <span>{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center text-blue-400">
                                <FiMessageSquare className="mr-1" />
                                <span>{post.comments?.length || 0}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleDeletePost(post._id)}
                              className="p-2 text-red-500 hover:text-red-400 transition-colors duration-300"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                          
                          {post.comments?.length > 0 && (
                            <div className="mt-4 border-t border-gray-700 pt-3">
                              <h4 className="text-sm font-medium mb-2">Recent Comments</h4>
                              <div className="space-y-2 max-h-24 overflow-y-auto pr-2">
                                {post.comments.slice(0, 2).map((comment, index) => (
                                  <div key={index} className="text-xs bg-gray-700 rounded p-2">
                                    <span className="font-semibold text-pink-400">{comment.user}: </span>
                                    <span className="text-gray-300">{comment.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  className="bg-gray-800 rounded-xl p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    You haven't created any posts. Start sharing your thoughts with the community!
                  </p>
                  <button className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-full transition-all duration-300">
                    Create Your First Post
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'liked' && (
            <motion.div
              key="liked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FiHeart className="mr-2 text-pink-500" />
                Liked Posts
              </h2>
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold mb-2">No Liked Posts</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Posts you like will appear here. Start exploring and liking content!
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Posts
              </h2>
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">No Saved Posts</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Save posts to easily find them later. Click the bookmark icon on any post to save it.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Bio</label>
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Location</label>
                  <input
                    type="text"
                    value={editedProfile.location || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Avatar URL</label>
                  <input
                    type="text"
                    value={editedProfile.avatar}
                    onChange={(e) => setEditedProfile({...editedProfile, avatar: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors duration-300"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileUpdated;