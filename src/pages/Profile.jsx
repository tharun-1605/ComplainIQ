import React, { useEffect, useState } from 'react';
import { auth, posts as postsApi, API_BASE_URL } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { 
  Grid, 
  List, 
  Heart, 
  MessageCircle, 
  LogOut, 
  Trash2, 
  Calendar, 
  Mail, 
  Plus, 
  Settings, 
  CheckCircle,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'feed'
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profile • ComplainIQ";
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
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load user profile.');
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
    toast.success('Logged out');
    navigate('/');
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsApi.delete(postId);
      setUserPosts(userPosts.filter(p => p._id !== postId));
      toast.success('Post removed');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalUpvotes = userPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const resolvedCount = userPosts.filter(p => p.status === 'Resolved' || p.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-rose-500 selection:text-white pb-16 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* Instagram Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#262626] pb-8">
          
          {/* Avatar with IG Gradient Ring */}
          <div className="story-ring flex-shrink-0">
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-black"
            />
          </div>

          {/* Profile Stats & Details */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            
            {/* Username & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">{profile.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => toast.success('Profile settings updated')}
                  className="px-4 py-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-xs font-semibold text-white transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-rose-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instagram Counts Row */}
            <div className="flex items-center justify-center sm:justify-start gap-8 text-sm">
              <div>
                <span className="font-bold text-white">{userPosts.length}</span>{' '}
                <span className="text-gray-400 text-xs">posts</span>
              </div>
              <div>
                <span className="font-bold text-white">{totalUpvotes}</span>{' '}
                <span className="text-gray-400 text-xs">upvotes</span>
              </div>
              <div>
                <span className="font-bold text-white">{resolvedCount}</span>{' '}
                <span className="text-gray-400 text-xs">resolved</span>
              </div>
            </div>

            {/* Bio & Email */}
            <div className="space-y-1 text-xs">
              <p className="text-gray-200 font-medium">{profile.bio}</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-400 text-[11px]">
                <Mail className="w-3.5 h-3.5" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Square Grid vs List Feed) */}
        <div className="flex items-center justify-center border-b border-[#262626]">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 py-3 px-6 text-xs font-bold tracking-wider uppercase border-t-2 transition-colors ${
              viewMode === 'grid'
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" /> GRID
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`flex items-center gap-2 py-3 px-6 text-xs font-bold tracking-wider uppercase border-t-2 transition-colors ${
              viewMode === 'feed'
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" /> FEED
          </button>
        </div>

        {/* Posts Content */}
        {userPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0a0a0a] border border-[#262626] rounded-2xl">
            <Plus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Posts Yet</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">
              When you share civic complaints, they will appear on your profile feed.
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors"
            >
              Share Your First Post
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* Instagram 3-Column Square Grid Layout */
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {userPosts.map((post) => (
              <div
                key={post._id}
                className="relative aspect-square bg-[#121212] overflow-hidden group cursor-pointer border border-[#1e1e1e]"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full p-3 flex items-center justify-center text-center text-xs text-gray-400 font-medium line-clamp-3 bg-[#161616]">
                    {post.content}
                  </div>
                )}

                {/* Hover Overlay with Heart & Comment Count */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" /> {post.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" /> {post.comments?.length || 0}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post._id);
                    }}
                    className="absolute top-2 right-2 p-1 text-rose-400 hover:text-rose-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List Feed View */
          <div className="space-y-6">
            {userPosts.map((post) => (
              <article key={post._id} className="ig-card overflow-hidden">
                <div className="p-3 sm:p-4 flex items-center justify-between border-b border-[#1e1e1e]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase border border-[#333]">
                      {profile.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white">{profile.name}</span>
                      <p className="text-[10px] text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={post.status} />
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-gray-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 text-xs text-gray-200 leading-relaxed">
                  {post.content}
                </div>

                {post.image && (
                  <div className="bg-[#121212]">
                    <img src={post.image} alt="Post" className="w-full max-h-96 object-cover" />
                  </div>
                )}

                <div className="p-3 border-t border-[#1e1e1e] flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <Heart className="w-4 h-4 fill-rose-500" /> {post.likes || 0} Upvotes
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400 font-semibold">
                    <MessageCircle className="w-4 h-4" /> {post.comments?.length || 0} Comments
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;