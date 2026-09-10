import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { API_BASE_URL } from '../services/api';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ShareIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const CATEGORIES = ['All', 'Infrastructure', 'Water Supply', 'Electricity', 'Sanitation', 'Public Safety'];

function UserDashboard() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [zoomImage, setZoomImage] = useState(null);
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    document.title = "Civic Feed | ComplainIQ";
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view the complaint feed.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/user/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch public complaints.');
        const fetchedData = await response.json();
        setPosts(fetchedData.reverse());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, { 
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to update like status');
      const updatedPost = await response.json();
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, likes: updatedPost.likes, isLiked: !post.isLiked }
            : post
        )
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCommentSubmit = async (postId, commentText) => {
    if (!commentText || !commentText.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });
      if (!response.ok) throw new Error('Failed to submit comment');
      const addedComment = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), addedComment] }
            : post
        )
      );
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error(error.message);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleCommentLike = (commentId) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Filter posts based on search & selected category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = (post.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      (post.category && post.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Header & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Public Complaints Feed
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                Live Governance
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Explore civic issues reported by citizens and track official resolution statuses
            </p>
          </div>

          <Link
            to="/create-post"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white gradient-bg hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            File New Complaint
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card rounded-2xl p-4 mb-8 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search complaints by keyword, category, or submitter..."
                className="w-full pl-11 pr-10 py-3 glass-input rounded-xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-custom">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-2">
              <FunnelIcon className="w-3.5 h-3.5" /> Filter:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-slate-900/60 text-gray-300 hover:bg-slate-800 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-6 text-center text-rose-300 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Feed Posts */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-16 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-white/10 p-8">
            <SparklesIcon className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white mb-1">No Complaints Found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search criteria or category filter.'
                : 'Be the first citizen to file a public complaint in your area!'}
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg"
            >
              <PlusIcon className="w-4 h-4" />
              File Complaint Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-card glass-card-hover rounded-3xl border border-white/10 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {(post.user?.name || post.user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{post.user?.name || post.user?.username || 'Anonymous Submitter'}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                          {post.category || 'General'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Submitted on {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={post.status} />
                </div>

                {/* Complaint Body */}
                <div className="px-5 sm:px-6 pb-4">
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Media Attachment */}
                {(post.image || post.video) && (
                  <div className="relative bg-slate-950/60 overflow-hidden cursor-pointer group">
                    {post.image && (
                      <div className="relative">
                        <img 
                          src={post.image} 
                          alt="Complaint Proof" 
                          className="w-full max-h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                          onClick={() => setZoomImage(post.image)}
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setZoomImage(post.image)}
                            className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20"
                          >
                            Click to View Fullsize
                          </button>
                        </div>
                      </div>
                    )}
                    {post.video && (
                      <video controls className="w-full max-h-96 object-cover">
                        <source src={post.video} type="video/mp4" />
                      </video>
                    )}
                  </div>
                )}

                {/* Admin Official Response (If Present) */}
                {post.adminReply && (
                  <div className="mx-5 sm:mx-6 my-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      <SparklesIcon className="w-4 h-4" />
                      Official Admin Resolution Response
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-100">
                      {post.adminReply}
                    </p>
                  </div>
                )}

                {/* Action Bar (Upvotes & Comments) */}
                <div className="px-5 sm:px-6 py-4 border-t border-white/5 flex items-center justify-between bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleLike(post._id)} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        post.isLiked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800/80 text-gray-300 hover:text-white hover:bg-slate-800 border border-white/5'
                      }`}
                    >
                      {post.isLiked ? (
                        <HeartSolidIcon className="w-4 h-4 text-rose-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                      <span>{post.likes || 0} Upvotes</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleComments(post._id)} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/80 text-gray-300 hover:text-white hover:bg-slate-800 border border-white/5 transition-all"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>

                  <span className="text-xs text-gray-400 hidden sm:inline">
                    ID: #{post._id ? post._id.slice(-6) : 'N/A'}
                  </span>
                </div>

                {/* Comments Section Drawer */}
                <AnimatePresence>
                  {showComments[post._id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-slate-950/80 p-5 space-y-4"
                    >
                      {/* Comments List */}
                      <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-custom pr-1">
                        {(!post.comments || post.comments.length === 0) ? (
                          <p className="text-xs text-gray-400 italic text-center py-2">No citizen comments yet. Leave a thought below!</p>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment._id || Math.random()} className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-indigo-300">
                                  {comment.author?.username || comment.username || 'Citizen'}
                                </span>
                                <button
                                  onClick={() => toggleCommentLike(comment._id)}
                                  className="text-[10px] text-gray-400 hover:text-rose-400"
                                >
                                  {likedComments[comment._id] ? '❤️ Upvoted' : '🤍 Upvote'}
                                </button>
                              </div>
                              <p className="text-xs text-gray-200">{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a constructive comment..."
                          className="flex-1 glass-input rounded-xl px-4 py-2 text-xs"
                          value={newComment[post._id] || ''}
                          onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCommentSubmit(post._id, newComment[post._id]);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleCommentSubmit(post._id, newComment[post._id])}
                          disabled={!newComment[post._id]?.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg disabled:opacity-50"
                        >
                          Post
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Image Zoom Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setZoomImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors z-10"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <img
                src={zoomImage}
                alt="Enlarged Proof"
                className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserDashboard;