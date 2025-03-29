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
      const fetchedData = await response.json(); // Parse the response body as JSON
      console.log('Fetched posts:', fetchedData); // Log the fetched posts for debugging
      
      console.log('Response Status:', response.status); // Log the response status
      if (!response.ok) {
        console.error('Failed to fetch posts:', response.statusText); // Log any errors
        return; // Exit if the response is not ok
      }
      
      setPosts(fetchedData); // Set posts data
    };
    fetchPosts();
  }, []);
  
  const [comments, setComments] = useState({});

  const handleLike = async (postId) => {
    if (!postId) {
        console.error('Post ID is undefined'); // Log error if postId is undefined
        return; // Exit the function if postId is not valid
    }
    console.log('Liking post with ID:', postId); // Debugging log to check postId
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to like post');
        }
        const updatedPost = await response.json();
        setPosts(posts.map(post => {
            if (post._id === postId) {
                return {
                    ...post,
                    likes: updatedPost.likes,
                    isLiked: !post.isLiked
                };
            }
            return post;
        }));
    } catch (error) {
        console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (postId, comment) => {
    try {
        await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment })
        });
        setComments(prevComments => ({
            ...prevComments,
            [postId]: [...(prevComments[postId] || []), comment],
        }));
    } catch (error) {
        console.error('Error adding comment:', error);
    }
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
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map(post => (
                <div key={post._id} className="bg-white shadow rounded-lg">

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
                </div>

                {/* Post Content */}
                <div className="px-4 py-2">
                  {post.image && (
                    <img src={post.image} alt="Post Image" className="w-full h-auto rounded-md" />
                  )}
                  <p className="text-gray-900">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-200 flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
                  >
                    {post.isLiked ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6" />
                    )}
                    <span>{post.likes}</span>
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
                        if (post._id) { 
                          handleCommentSubmit(post._id, e.target.value);
                          e.target.value = ''; // Clear the input after submission
                        } else {
                          console.error('Post ID is undefined'); // Error handling for undefined post ID
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
