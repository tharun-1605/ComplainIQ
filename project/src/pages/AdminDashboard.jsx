import { useState, useEffect } from 'react';
import { auth } from '../services/api';
import { Link } from 'react-router-dom';
import { ChartBarIcon, FlagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [expandedComments, setExpandedComments] = useState({}); // Track expanded comments

  const fetchUserProfile = async () => {
    try {
      const response = await auth.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error.message);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const fetchedData = await response.json();
        setPosts(fetchedData);
        setComplaints(fetchedData);
      } catch (error) {
        console.error('Failed to fetch posts:', error.message);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint._id === complaintId ? { ...complaint, status: newStatus } : complaint
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error.message);
    }
  };

  const handlePriorityChange = (complaintId, newPriority) => {
    setComplaints(prevComplaints =>
      prevComplaints.map(complaint =>
        complaint._id === complaintId ? { ...complaint, priority: newPriority } : complaint
      )
    );
  };

  const toggleComments = (complaintId) => {
    setExpandedComments(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  const sortedComplaints = [...complaints].sort((a, b) => b.likes - a.likes);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto mt-16 space-y-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Complaints</p>
                <p className="text-2xl font-semibold text-gray-900">{complaints.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FlagIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {complaints.filter(c => c.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {complaints.filter(c => c.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Complaints Management</h2>
            <p className="mt-1 text-sm text-gray-500">Sorted by number of likes (priority)</p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {sortedComplaints.map(complaint => (
                <li key={complaint._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {complaint.user && complaint.user.name ? (
                        <img
                          src={complaint.user.avatar}
                          alt={complaint.user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{complaint.user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={complaint.priority}
                        onChange={(e) => handlePriorityChange(complaint._id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <img
                      src={complaint.image}
                      alt="Complaint"
                      className="w-100% h-100% flex justify-center items-center overflow-hidden"
                    />
                    <p className="text-gray-900 mt-2">{complaint.content}</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span className="mr-4">👍 {complaint.likes} likes</span>
                    <span>💬 {complaint.comments.length} comments</span>
                    <button onClick={() => toggleComments(complaint._id)} className="ml-4 text-blue-500">
                      {expandedComments[complaint._id] ? 'Hide Comments' : 'Show Comments'}
                    </button>
                  </div>
                  {expandedComments[complaint._id] && (
                    <div className="mt-2">
                      <h3 className="font-medium text-gray-900">Comments:</h3>
                      <ul className="divide-y divide-gray-200">
                        {complaint.comments.map((comment, index) => (
                          <li key={index} className="py-2">
                            <p className="text-gray-800">{comment.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
