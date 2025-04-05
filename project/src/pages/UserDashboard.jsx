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
import clsx from 'clsx';

function UserDashboard() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/user/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch posts.');
        const fetchedData = await response.json();
        setPosts(fetchedData);
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
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
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
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
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
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme; // Update body class for theme
};
useEffect(() => {
  document.body.className = theme; // Set body class on theme change
}, [theme]);

  return (
    <div className="min-h-screen bg-black-100 flex flex-col justify-between pt-4 pb-20 relative">
    {/* <div className="min-h-screen bg-gray-50 flex flex-col justify-between pt-4 pb-20 relative"> */}
    <header className="bg-black p-5 text-xl font-bold text-center sticky top-0 z-10">
             Public Complaints
        </header>

      <main className="flex-1 max-w-xl mx-auto w-full p-4 space-y-6 bg-black-100">
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No posts available.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-black rounded-xl shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="flex items-center gap-3 p-3">
                <img
src={post.user?.avatar || '/path/to/local/default/avatar.png'}
                  alt={post.user?.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="flex flex-col items-start">
                  <p className="font-semibold text-white-800">{post.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-white-500">{new Date(post.createdAt).toLocaleString()}</p>
<p className="text-xs text-white-500">Status: {post.status} | Likes: {post.likes} | Comments: {post.comments?.length || 0}</p>
                </div>
              </div>

              {post.image && (
                <div
                  className="w-full max-h-[400px] overflow-hidden relative group cursor-pointer"
                  onDoubleClick={() => handleLike(post._id)}
                  onClick={() => setZoomImage(post.image)}
                >
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="p-4 space-y-3">
                <p className="text-sm text-white-800">{post.content}</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 text-white-600 hover:text-red-500 transition"
                  >
                    {post.isLiked ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6" />
                    )}
                    <span className="text-sm">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center gap-1 text-white-600 hover:text-blue-500 transition"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span className="text-xs">Comments</span>
                  </button>
                </div>

                {showComments[post._id] && post.comments && (
                  <div className="mt-3 max-h-40 overflow-y-auto pr-1 text-sm text-white-600 space-y-2">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex justify-between items-center">
                        <p>
                          👤 <strong>{comment.author.username}:</strong> {comment.text}
                        </p>
                        <button
                          onClick={() => toggleCommentLike(comment._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          {likedComments[comment._id] ? (
                            <HeartSolidIcon className="h-4 w-4 text-red-500" />
                          ) : (
                            <HeartIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
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

      <footer className="bg-black shadow-md p-3 fixed bottom-0 left-0 right-0 flex justify-around border-t z-10">
        <Link to="/" className="flex flex-col items-center text-white-600 hover:text-blue-500">
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/create-post" className="flex flex-col items-center text-white-600 hover:text-blue-500">
          <PlusCircleIcon className="h-6 w-6" />
          <span className="text-xs">New</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-white-600 hover:text-blue-500">
          <UserIcon className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </footer>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <XMarkIcon
              className="absolute top-4 right-4 h-6 w-6 text-white cursor-pointer z-30"
              onClick={() => setZoomImage(null)}
            />
            <img
              src={zoomImage}
              alt="Zoomed"
              className="w-full max-h-[90vh] object-contain rounded-xl shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;