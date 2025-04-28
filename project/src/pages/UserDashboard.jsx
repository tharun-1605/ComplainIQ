import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  HomeIcon,
  PlusCircleIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import debounce from 'lodash.debounce';

function UserDashboard() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [zoomImage, setZoomImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation(); // to highlight active link

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!authHeaders.Authorization) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('https://public-complient-websitw.onrender.com/api/user/posts', {
          headers: authHeaders,
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
      const post = posts.find((p) => p._id === postId);
      const newLikeStatus = !post.isLiked;

      const response = await fetch(`https://public-complient-websitw.onrender.com/api/posts/${postId}/like`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Failed to like post');
      const updatedPost = await response.json();

      setPosts(posts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: newLikeStatus ? p.likes + 1 : p.likes - 1, // increase/decrease like count
              isLiked: newLikeStatus, // toggle like status
            }
          : p
      ));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCommentSubmit = async (postId, commentText) => {
    if (!commentText.trim()) return; // prevent empty comment
    try {
      const response = await fetch(`https://public-complient-websitw.onrender.com/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
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

  // Debounced search function
  const debouncedSearch = useCallback(debounce((query) => {
    setSearchQuery(query);
  }, 300), []);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredPosts = posts.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to get the status color class
  const getStatusColorClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-white'; // default color for unknown status
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className={`transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'} h-auto md:h-screen sticky top-0 border-r border-zinc-800 bg-zinc-900 p-4 overflow-hidden flex flex-col gap-6`}>
        {isSidebarOpen && (
          <>
            <h1 className="text-2xl font-bold text-center">ComplainIQ</h1>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search Complaints..."
                  className="w-full px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleSearchChange}
                />
              </div>
              <Link to="/" className={`flex items-center gap-3 p-2 rounded hover:bg-zinc-800 ${location.pathname === '/' && 'bg-zinc-800'}`}>
                <HomeIcon className="w-6 h-6" />
                <span>Home</span>
              </Link>
              <Link to="/create-post" className={`flex items-center gap-3 p-2 rounded hover:bg-zinc-800 ${location.pathname === '/create-post' && 'bg-zinc-800'}`}>
                <PlusCircleIcon className="w-6 h-6" />
                <span>Create Post</span>
              </Link>
              <Link to="/profile" className={`flex items-center gap-3 p-2 rounded hover:bg-zinc-800 ${location.pathname === '/profile' && 'bg-zinc-800'}`}>
                <UserIcon className="w-6 h-6" />
                <span>Profile</span>
              </Link>
            </div>
          </>
        )}
      </aside>

      {/* Three-Dot Icon */}
      <div className="absolute top-4 left-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto p-6">
        <header className="sticky top-0 z-10 bg-black p-4 border-b border-zinc-800 text-center">
          <h2 className="text-xl font-semibold">Public Complaints</h2>
        </header>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {loading ? (
          <div className="space-y-6 mt-6">
            {[1,2,3].map((_, idx) => (
              <div key={idx} className="h-40 bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <p className="text-center text-gray-400 mt-6">No matching posts found.</p>
        ) : (
          filteredPosts.map((post) => (
            <div key={post._id} className="bg-zinc-900 rounded-lg mb-6 shadow-lg">
              <div className="flex items-center gap-3 p-3">
                <img
                  src={post.user?.avatar || '/path/to/default/avatar.png'}
                  alt={post.user?.name || 'User Avatar'}
                  loading="lazy"
                  className="w-10 h-10 rounded-full border object-cover"
                />
                <div>
                  <p className="font-semibold">{post.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                  <p className={`text-xs ${getStatusColorClass(post.status)}`}>
                    Status: {post.status} | Likes: {post.likes} | Comments: {post.comments?.length || 0}
                  </p>
                </div>
              </div>

              {(post.image || post.video) && (
                <div
                  className="w-full overflow-hidden cursor-pointer"
                  onDoubleClick={() => handleLike(post._id)}
                  onClick={() => post.image && setZoomImage(post.image)}
                >
                  {post.image && (
                    <img src={post.image} loading="lazy" alt="Post" className="w-full object-cover max-h-[400px]" />
                  )}
                  {post.video && (
                    <video controls className="w-full object-cover max-h-[400px]">
                      <source src={post.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <p className="text-sm">{post.content}</p>
              </div>

              {/* Like Button */}
              <button
                onClick={() => handleLike(post._id)}
                className="flex items-center gap-1 p-3 text-white hover:bg-zinc-800 w-full border-t border-zinc-800"
              >
                <ArrowUpIcon className={`w-6 h-6 ${post.isLiked ? 'text-blue-500' : 'text-white'}`} />
                <span className="text-sm">{post.likes}</span>
              </button>

              {/* Comments */}
              <div>
                {showComments[post._id] && (
                  <div className="space-y-2">
                    {post.comments?.map((comment) => (
                      <div key={comment._id} className="p-4">
                        <p>{comment.text}</p>
                        <button onClick={() => toggleCommentLike(comment._id)}>
                          <ArrowUpIcon
                            className={`w-5 h-5 ${likedComments[comment._id] ? 'text-blue-500' : 'text-gray-400'}`}
                          />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full px-2 py-1 rounded-md bg-zinc-800 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommentSubmit(post._id, e.target.value);
                      }}
                    />
                  </div>
                )}
                <button
                  className="text-sm text-blue-500"
                  onClick={() => toggleComments(post._id)}
                >
                  {showComments[post._id] ? 'Hide comments' : 'Show comments'}
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default UserDashboard;