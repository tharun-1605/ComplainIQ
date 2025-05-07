import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  HomeIcon,
  PlusCircleIcon,
  UserIcon,
  XMarkIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

function UserDashboard() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [zoomImage, setZoomImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('https://public-complient-websitw.onrender.com/api/user/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch posts.');
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
      const response = await fetch(`https://public-complient-websitw.onrender.com/api/posts/${postId}/like`, { 
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to like post');
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
    if (!commentText.trim()) return;
    try {
      const response = await fetch(`https://public-complient-websitw.onrender.com/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });
      if (!response.ok) throw new Error('Failed to submit comment');
      const newComment = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), newComment] }
            : post
        )
      );
      setNewComment({...newComment, [postId]: ''});
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

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-full bg-gray-800/80 backdrop-blur-sm"
      >
        <Bars3Icon className="w-6 h-6 text-white" />
      </button>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: window.innerWidth <= 768 ? (isSidebarOpen ? 0 : -300) : 0,
          opacity: isSidebarOpen ? 1 : (window.innerWidth <= 768 ? 0 : 1)
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 border-r border-gray-700/50 bg-gray-800/30 backdrop-blur-lg p-4 flex flex-col gap-6`}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col h-full"
        >
          <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 py-4">
            ComplainIQ
          </h1>
          
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Complaints..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <nav className="flex flex-col gap-2 flex-grow">
            <Link 
              to="/" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
            >
              <HomeIcon className="w-6 h-6 text-indigo-400" />
              <span>Home</span>
            </Link>
            <Link 
              to="/create-post" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
            >
              <PlusCircleIcon className="w-6 h-6 text-green-400" />
              <span>Create Post</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
            >
              <UserIcon className="w-6 h-6 text-blue-400" />
              <span>Profile</span>
            </Link>
            <Link 
              to="/completed-complaints" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
            >
              <FlagIcon className="w-6 h-6 text-yellow-400" />
              <span>Completed Complaints</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-3 p-3 text-sm text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              <span>User Profile</span>
            </div>
          </div>
        </motion.div>
      </motion.aside>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} max-w-2xl mx-auto p-4 md:p-6`}>
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl mb-6 border border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Public Complaints
          </h2>
        </motion.header>

        {error && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-400">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 text-gray-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No posts available</p>
            <Link 
              to="/create-post" 
              className="mt-4 inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Create your first post
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl mb-6 border border-gray-700/50 overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-shadow"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="relative">
                    <img
                      src={post.user?.avatar || '/default-avatar.png'}
                      alt={post.user?.name}
                      className="w-10 h-10 rounded-full border-2 border-indigo-500/50 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div>
                    <p className="font-semibold">{post.user?.name || 'Unknown'}</p>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{post.status}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <p className="text-gray-200">{post.content}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-400">Category: {post.category || 'N/A'}</p>
                </div>

                {(post.image || post.video) && (
                  <div className="relative group">
                    <div
                      className="w-full overflow-hidden cursor-pointer"
                      onDoubleClick={() => handleLike(post._id)}
                      onClick={() => post.image && setZoomImage(post.image)}
                    >
                      {post.image && (
                        <motion.img 
                          src={post.image} 
                          alt="Post" 
                          className="w-full object-cover max-h-[500px]"
                          whileHover={{ scale: 1.01 }}
                        />
                      )}
                      {post.video && (
                        <video controls className="w-full object-cover max-h-[500px] rounded-b-lg">
                          <source src={post.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {post.image && (
                        <button 
                          className="p-2 bg-black/50 rounded-full backdrop-blur-sm"
                          onClick={() => setZoomImage(post.image)}
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(post._id)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors"
                    >
                      {post.isLiked ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-300" />
                      )}
                      <span className="text-sm">{post.likes}</span>
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleComments(post._id)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors"
                    >
                      <ChatBubbleLeftIcon className="w-5 h-5 text-gray-300" />
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showComments[post._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 mb-3">
                          {post.comments?.map((comment) => (
                            <motion.div 
                              key={comment._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-start gap-2 p-3 bg-gray-700/30 rounded-lg"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs">
                                👤
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-sm">{comment.author.username}</span>
                                  <button 
                                    onClick={() => toggleCommentLike(comment._id)}
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    {likedComments[comment._id] ? 'Liked' : 'Like'}
                                  </button>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-grow px-4 py-2 rounded-full bg-gray-700/50 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={newComment[post._id] || ''}
                      onChange={(e) => setNewComment({...newComment, [post._id]: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(post._id, e.target.value);
                        }
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCommentSubmit(post._id, newComment[post._id])}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors text-sm"
                      disabled={!newComment[post._id]?.trim()}
                    >
                      Post
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl w-full"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-2 right-2 z-10 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-full backdrop-blur-sm"
                onClick={() => setZoomImage(null)}
                aria-label="Close zoomed image"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </motion.button>
              <img 
                src={zoomImage} 
                alt="Zoomed" 
                className="w-full max-h-[90vh] object-contain rounded-xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserDashboard;