import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { API_BASE_URL } from '../services/api';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Sparkles, 
  CheckCircle, 
  X, 
  MapPin,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STORIES = [
  { id: 'All', name: 'All Issues', emoji: '🏛️' },
  { id: 'Electric', name: 'Electricity', emoji: '⚡' },
  { id: 'Water', name: 'Water', emoji: '💧' },
  { id: 'Drainage', name: 'Sanitation', emoji: '🧹' },
  { id: 'Social Problem', name: 'Public Safety', emoji: '🛡️' },
  { id: 'Air', name: 'Environment', emoji: '🌿' },
  { id: 'Others', name: 'General', emoji: '📌' },
];

function UserDashboard() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [doubleTapHeart, setDoubleTapHeart] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    document.title = "ComplainIQ • Instagram Feed";
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
        if (!response.ok) throw new Error('Failed to fetch complaints.');
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
      if (!response.ok) throw new Error('Failed to update upvote');
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

  const handleDoubleTap = (postId) => {
    setDoubleTapHeart((prev) => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setDoubleTapHeart((prev) => ({ ...prev, [postId]: false }));
    }, 800);

    const post = posts.find(p => p._id === postId);
    if (post && !post.isLiked) {
      handleLike(postId);
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

  const toggleBookmark = (postId) => {
    setSavedPosts(prev => {
      const isSaved = !prev[postId];
      toast.success(isSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
      return { ...prev, [postId]: isSaved };
    });
  };

  const handleShare = (post) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Complaint link copied to clipboard!');
    }
  };

  // Filter posts based on story selection
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'All') return true;
    return post.category && post.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-rose-500 selection:text-white pb-16 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-0 sm:px-4 py-4 space-y-6">
        
        {/* Instagram Story Highlights Category Bar */}
        <div className="bg-black sm:bg-[#0a0a0a] sm:border border-[#262626] sm:rounded-2xl p-3 flex items-center gap-4 overflow-x-auto scrollbar-custom border-b border-[#262626] sm:border-b">
          {STORIES.map((story) => {
            const isSelected = selectedCategory === story.id;
            return (
              <button
                key={story.id}
                onClick={() => setSelectedCategory(story.id)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
              >
                <div className={isSelected ? 'story-ring' : 'story-ring-gray transition-colors group-hover:bg-[#363636]'}>
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-2xl border-2 border-black">
                    {story.emoji}
                  </div>
                </div>
                <span className={`text-[11px] tracking-tight font-medium max-w-[64px] truncate ${isSelected ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {story.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Instagram Feed Stream */}
        {loading ? (
          <div className="space-y-6 px-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e1e1e]"></div>
                  <div className="h-4 bg-[#1e1e1e] rounded w-1/3"></div>
                </div>
                <div className="h-80 bg-[#1e1e1e] rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0a0a0a] border border-[#262626] rounded-2xl">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Posts in this Category</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">
              Be the first citizen to report an issue in this category.
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors"
            >
              Share Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredPosts.map((post) => {
              const hasMedia = post.image || post.video;
              const authorName = post.user?.name || post.user?.username || 'Citizen';

              return (
                <article
                  key={post._id}
                  className="ig-card overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="story-ring">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-black uppercase">
                          {authorName[0]}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{authorName}</span>
                          <StatusBadge status={post.status} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-white p-1">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Media Aspect Ratio Container with Double-Tap Gesture */}
                  {hasMedia ? (
                    <div 
                      className="relative bg-[#121212] overflow-hidden select-none"
                      onDoubleClick={() => handleDoubleTap(post._id)}
                    >
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt="Complaint Proof" 
                          className="w-full object-cover max-h-[500px]"
                        />
                      )}
                      {post.video && (
                        <video controls className="w-full max-h-[500px] object-cover">
                          <source src={post.video} type="video/mp4" />
                        </video>
                      )}

                      {/* Double Tap Animated Popping Heart Overlay */}
                      <AnimatePresence>
                        {doubleTapHeart[post._id] && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-pop drop-shadow-2xl" />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="px-4 py-6 bg-gradient-to-br from-[#121212] to-[#1a1a1a] border-y border-[#262626]">
                      <p className="text-sm sm:text-base font-normal text-gray-100 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Action Icons Row */}
                  <div className="p-3 sm:p-4 pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(post._id)}
                          className="focus:outline-none transition-transform active:scale-125"
                        >
                          <Heart 
                            className={`w-6 h-6 ${post.isLiked ? 'text-rose-500 fill-rose-500' : 'text-white hover:text-gray-300'}`} 
                          />
                        </button>
                        
                        <button 
                          onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                          className="focus:outline-none text-white hover:text-gray-300 transition-colors"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>

                        <button 
                          onClick={() => handleShare(post)}
                          className="focus:outline-none text-white hover:text-gray-300 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => toggleBookmark(post._id)}
                        className="focus:outline-none transition-colors"
                      >
                        <Bookmark 
                          className={`w-6 h-6 ${savedPosts[post._id] ? 'text-white fill-white' : 'text-white hover:text-gray-300'}`} 
                        />
                      </button>
                    </div>

                    {/* Likes Social Proof */}
                    <div className="mb-2">
                      <span className="font-bold text-xs text-white">
                        {post.likes || 0} upvotes
                      </span>
                    </div>

                    {/* Caption Block (If image present, render content as caption) */}
                    {hasMedia && (
                      <div className="text-xs text-white mb-2 leading-relaxed">
                        <span className="font-bold mr-2">{authorName}</span>
                        <span className="text-gray-200">{post.content}</span>
                        <div className="mt-1 text-sky-400 font-medium">
                          #{post.category || 'CivicIssue'} #ComplainIQ
                        </div>
                      </div>
                    )}

                    {/* Official Admin Reply Highlight */}
                    {post.adminReply && (
                      <div className="my-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Official Resolution Response
                        </div>
                        <p className="text-xs text-emerald-100">
                          {post.adminReply}
                        </p>
                      </div>
                    )}

                    {/* Comments Toggle Button */}
                    <button 
                      onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                      className="text-xs text-gray-500 font-medium mb-2 block hover:underline"
                    >
                      {post.comments?.length > 0 
                        ? `View all ${post.comments.length} comments` 
                        : 'Add a comment...'}
                    </button>

                    {/* Comments Drawer */}
                    <AnimatePresence>
                      {showComments[post._id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 mb-3 pt-2 border-t border-[#262626]"
                        >
                          {post.comments?.map((comment) => (
                            <div key={comment._id || Math.random()} className="flex items-start justify-between text-xs py-1">
                              <div>
                                <span className="font-bold text-white mr-2">
                                  {comment.author?.username || comment.username || 'Citizen'}
                                </span>
                                <span className="text-gray-300">{comment.text}</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Inline Comment Input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="bg-transparent text-xs text-white placeholder-gray-500 outline-none flex-1 py-1"
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
                        className="text-xs font-bold text-sky-500 hover:text-sky-400 disabled:opacity-40 transition-colors"
                      >
                        Post
                      </button>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;