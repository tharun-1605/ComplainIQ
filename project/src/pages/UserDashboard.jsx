import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

function UserDashboard() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token'); // Assuming the token is stored in local storage
      console.log('Token:', token); // Log the token for debugging
      const response = await fetch('http://localhost:5000/api/user/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response Status:', response.status); // Log the response status
      const responseBody = await response.text(); // Get the response body as text
      if (!response.ok) {
        console.error('Failed to fetch posts:', response.statusText); // Log any errors
        console.log('Response Status:', response.status); // Log the response status
        console.log('Response Body:', responseBody); // Log the response body for debugging
        return;
      }
      console.log('Response Body:', responseBody); // Log the response body for debugging

      if (!response.ok) {
        console.error('Failed to fetch posts:', response.statusText); // Log any errors
        return;
      }
      
      const data = JSON.parse(responseBody); // Parse the response body as JSON
      setPosts(data);
    };
    fetchPosts();
  }, []);
  
  const [comments, setComments] = useState({});

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleCommentSubmit = (postId, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), comment],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Public Complaints</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/create-post"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Post
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white shadow rounded-lg">
              {/* Post Header */}
              <div className="p-4 flex items-center space-x-3">
                {post.user && post.user.avatar ? (
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300" /> // Placeholder for missing avatar
                )}
                <div>
                  <p className="font-medium text-gray-900">{post.user ? post.user.name : 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium
                  ${post.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    post.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {post.status}
                </span>
              </div>

              {/* Post Content */}
              <div className="px-4 py-2">
                <p className="text-gray-900">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center space-x-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
                >
                  {post.isLiked ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                  <span>{post.likes}</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                >
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                  <span>{post.comments}</span>
                </button>
              </div>

              {/* Comment Input */}
              <div className="px-4 py-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="border rounded p-2 w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommentSubmit(post.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="mt-2">
                  {comments[post.id] && comments[post.id].map((comment, index) => (
                    <p key={index} className="text-gray-600">{comment}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
