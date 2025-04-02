import React, { useEffect, useState } from 'react';
import { auth } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: '',
    location: null,
    joinedDate: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile();
        setProfile(response.data);
        setEditedProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (Array.isArray(response.data)) {
          setUserPosts(response.data);
        } else {
          setUserPosts([]);
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };
    fetchUserPosts();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await auth.updateProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to save profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6 mt-10">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-28 h-28 rounded-full border-4 border-pink-500"
            />
          </div>
          <h2 className="text-2xl font-semibold mt-3">{profile.name}</h2>
          <p className="text-gray-500">{profile.email}</p>
          <p className="text-gray-700 mt-2">{profile.bio}</p>
          <div className="flex space-x-4 mt-4">
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">Edit Profile</button>
            <button onClick={handleLogout} className="px-4 py-2 text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600">Logout</button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-6">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <div className="grid grid-cols-3 gap-2">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="w-full aspect-square bg-gray-300 rounded-lg overflow-hidden">
                {post.image && <img src={post.image} alt={post.title} className="w-full h-full object-cover" />}
              </div>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;