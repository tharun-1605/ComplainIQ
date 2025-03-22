import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

function UserDashboard() {
const [posts, setPosts] = useState([]);


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
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{post.user.name}</p>
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
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
