import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, HomeIcon, PlusCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

function UserDashboard() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/user/posts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch posts.');
        const fetchedData = await response.json();
        setPosts(fetchedData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    if (!postId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to like post');
      const updatedPost = await response.json();
      setPosts(posts.map(post => post._id === postId ? { ...post, likes: updatedPost.likes, isLiked: !post.isLiked } : post));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCommentSubmit = async (postId, comment) => {
    if (!comment.trim()) return;
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      if (!response.ok) throw new Error('Failed to add comment');
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col justify-between">
      <header className="bg-white shadow p-4 text-center text-2xl font-bold text-gray-900">
        Public Complaints
      </header>
      <main className="max-w-2xl mx-auto mt-4 space-y-6 flex-1">
        {error && <p className="text-red-500">{error}</p>}
        {posts.length === 0 ? <p className="text-center text-gray-500">No posts available.</p> : posts.map(post => (
          <div key={post._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 flex items-center space-x-3">
              {post.user?.avatar ? <img src={post.user.avatar} alt={post.user.name} className="h-10 w-10 rounded-full" /> : <div className="h-10 w-10 rounded-full bg-gray-300" />}
              <div>
                <p className="font-medium text-gray-900">{post.user?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {post.image && <div className="w-full h-80 flex justify-center items-center overflow-hidden">
              <img src={post.image} alt="Post" className="max-w-full max-h-full object-contain" />
            </div>}
            <div className="p-4">
              <p className="text-gray-900">{post.content}</p>
              <div className="flex justify-between items-center mt-3">
                <button onClick={() => handleLike(post._id)} className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
                  {post.isLiked ? <HeartSolidIcon className="h-6 w-6 text-red-500" /> : <HeartIcon className="h-6 w-6" />}
                  <span>{post.likes}</span>
                </button>
              </div>
              <input type="text" placeholder="Add a comment..." className="border rounded p-2 w-full mt-2" onKeyDown={(e) => {
                if (e.key === 'Enter' && post._id) {
                  handleCommentSubmit(post._id, e.target.value);
                  e.target.value = '';
                }
              }} />
            </div>
          </div>
        ))}
      </main>
      <footer className="bg-white shadow p-4 fixed bottom-0 left-0 w-full flex justify-around">
        <Link to="/" className="text-gray-700 hover:text-blue-500"><HomeIcon className="h-6 w-6" /></Link>
        <Link to="/create-post" className="text-gray-700 hover:text-blue-500"><PlusCircleIcon className="h-6 w-6" /></Link>
        <Link to="/profile" className="text-gray-700 hover:text-blue-500"><UserIcon className="h-6 w-6" /></Link>
      </footer>
    </div>
  );
}

export default UserDashboard;