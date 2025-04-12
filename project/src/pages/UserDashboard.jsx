import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  HomeIcon,
  PlusCircleIcon,
  UserIcon,
  XMarkIcon,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

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
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} h-auto md:h-screen sticky top-0 border-r border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-6`}>
        {isSidebarOpen && (
          <>
            <h1 className="text-2xl font-bold text-center">Complaints</h1>
            <div className="flex justify-between items-center">
              {/* <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button> */}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search Complaints..."
                  className="w-full px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/" className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800">
                <HomeIcon className="w-6 h-6" />
                <span>Home</span>
              </Link>
              <Link to="/create-post" className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800">
                <PlusCircleIcon className="w-6 h-6" />
                <span>Create Post</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800">
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <p className="text-center text-gray-400">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400">No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-zinc-900 rounded-lg mb-6 shadow-lg">
              <div className="flex items-center gap-3 p-3">
                <img
                  src={post.user?.avatar || '/path/to/default/avatar.png'}
                  alt={post.user?.name}
                  className="w-10 h-10 rounded-full border object-cover"
                />
                <div>
                  <p className="font-semibold">{post.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    Status: {post.status} | Likes: {post.likes} | Comments: {post.comments?.length || 0}
                  </p>
                </div>
              </div>

              {(post.image || post.video) && (
                <div
                  className="w-full overflow-hidden cursor-pointer"
                  onDoubleClick={() => handleLike(post._id)}
                >
                  {post.image && (
                  <img src={post.image} alt="Post" className="w-full object-cover max-h-[400px]" />
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
                <p className="mb-3 text-sm">{post.content}</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleLike(post._id)} className="flex items-center gap-1">
                    {post.isLiked ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-white" />
                    )}
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1 text-white">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span className="text-sm">Comments</span>
                  </button>
                </div>

                {showComments[post._id] && post.comments && (
                  <div className="mt-3 max-h-40 overflow-y-auto pr-1 space-y-2 text-sm">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex justify-between items-center">
                        <p>
                          👤 <strong>{comment.author.username}:</strong> {comment.text}
                        </p>
                        <button onClick={() => toggleCommentLike(comment._id)}>
                          {likedComments[comment._id] ? (
                            <HeartSolidIcon className="w-4 h-4 text-red-500" />
                          ) : (
                            <HeartIcon className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full mt-2 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommentSubmit(post._id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          ))
        )}
      </main>

      {zoomImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <XMarkIcon
              className="absolute top-4 right-4 w-6 h-6 text-white cursor-pointer z-10"
              onClick={() => setZoomImage(null)}
            />
            <img src={zoomImage} alt="Zoomed" className="w-full max-h-[90vh] object-contain rounded-xl shadow-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
