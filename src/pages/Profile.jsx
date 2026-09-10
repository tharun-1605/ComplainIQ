import React, { useEffect, useState } from 'react';
import { auth, posts as postsApi, API_BASE_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { 
  FiEdit, 
  FiLogOut, 
  FiTrash2, 
  FiHeart, 
  FiMessageSquare, 
  FiUser, 
  FiMail, 
  FiMapPin, 
  FiCalendar 
} from 'react-icons/fi';
import { SparklesIcon } from '@heroicons/react/24/outline';

function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=600&q=80',
    bio: 'Civic member dedicated to improving community governance.',
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
    document.title = "User Profile | ComplainIQ";
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile();
        const data = response.data;
        setProfile({
          name: data.username || data.name || 'Citizen User',
          email: data.email || '',
          avatar: data.avatar || data.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=600&q=80',
          bio: data.bio || 'Civic member dedicated to improving community governance.',
          location: data.location || null,
          joinedDate: data.createdAt || null,
        });
        setEditedProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load user profile details.');
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
        const response = await axios.get(`${API_BASE_URL}/user/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data)) {
          setUserPosts(response.data);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
      }
    };
    fetchUserPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsApi.delete(postId);
      setUserPosts(userPosts.filter(p => p._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalUpvotes = userPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const resolvedCount = userPosts.filter(p => p.status === 'Resolved' || p.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Profile Hero Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt="Profile Avatar"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-2xl"
              />
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110"
              >
                <FiEdit className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.name}</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">{profile.bio}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-gray-300">
                  <FiMail className="text-indigo-400" />
                  <span>{profile.email}</span>
                </div>
                {profile.joinedDate && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-gray-300">
                    <FiCalendar className="text-indigo-400" />
                    <span>Member since {new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-xs font-semibold uppercase text-gray-400">Total Filed Complaints</p>
            <p className="text-2xl font-black text-white mt-1">{userPosts.length}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-xs font-semibold uppercase text-gray-400">Community Upvotes</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{totalUpvotes}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-xs font-semibold uppercase text-gray-400">Successfully Resolved</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{resolvedCount}</p>
          </div>
        </div>

        {/* User Activity Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUser className="text-indigo-400" />
            My Reported Incidents
          </h2>

          {userPosts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
              <SparklesIcon className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-bold text-white mb-1">No Reported Complaints Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                You haven't submitted any civic complaints yet.
              </p>
              <button
                onClick={() => navigate('/create-post')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg shadow-lg shadow-indigo-500/20"
              >
                File Your First Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPosts.map((post) => (
                <motion.div
                  key={post._id}
                  layout
                  className="glass-card glass-card-hover rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                        {post.category || 'General'}
                      </span>
                      <StatusBadge status={post.status} size="sm" />
                    </div>

                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-3">
                      {post.content}
                    </p>

                    {post.image && (
                      <div className="rounded-2xl overflow-hidden bg-slate-950/60 max-h-40">
                        <img src={post.image} alt="Evidence" className="w-full h-40 object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1 text-rose-400">
                        <FiHeart /> {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-400">
                        <FiMessageSquare /> {post.comments?.length || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete post"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;