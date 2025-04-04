import { useState, useEffect } from 'react';
import { ChartBarIcon, FlagIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/posts', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const fetchedData = await response.json();
        setComplaints(fetchedData);
        setFilteredComplaints(fetchedData);
      } catch (error) {
        console.error('Failed to fetch complaints:', error.message);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    let filtered = complaints.filter(c =>
      c.content.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (sortOption === 'Most Liked') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredComplaints(filtered);
  }, [search, statusFilter, sortOption, complaints]);

  const toggleComments = (id) => {
    setShowComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const url = `http://localhost:5000/api/user/complaints/${id}/status`;
      console.log('Updating status for ID:', id); // Debugging log
      console.log('Using URL:', url); // Debugging log

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        console.error(`Failed to update status: ${response.statusText}`);
        return;
      }

      const updatedComplaint = await response.json();
      console.log('Updated complaint:', updatedComplaint);

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === id ? { ...complaint, status: updatedComplaint.status } : complaint
        )
      );
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 rounded-lg flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <StatCard icon={<ChartBarIcon className="h-6 w-6 text-blue-500" />} title="Total Complaints" value={complaints.length} />
        <StatCard icon={<FlagIcon className="h-6 w-6 text-yellow-500" />} title="In Progress" value={complaints.filter(c => c.status === 'In Progress').length} />
        <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />} title="Completed" value={complaints.filter(c => c.status === 'Completed').length} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search complaints..."
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:text-white">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:text-white">
          <option value="Newest">Newest</option>
          <option value="Most Liked">Most Liked</option>
        </select>
      </div>

      {/* Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredComplaints.map(complaint => (
          <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
            <div className="flex items-center space-x-3">
              <img src={complaint.user?.avatar || '/default-avatar.png'} alt="User Avatar" className="h-8 w-8 rounded-full" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{complaint.user?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{complaint.content}</p>
            {complaint.image && <img src={complaint.image} alt="Complaint" className="mt-2 rounded-lg" />}
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>👍 {complaint.likes} Likes</span>
              <span>💬 {complaint.comments.length} Comments</span>
            </div>

            {/* Update Status Dropdown */}
            <div className="mt-2">
              <label htmlFor={`status-${complaint._id}`} className="text-sm text-gray-500 dark:text-gray-400">
                Update Status:
              </label>
              <select
                id={`status-${complaint._id}`}
                value={complaint.status}
                onChange={(e) => updateStatus(complaint._id, e.target.value)}
                className="ml-2 p-1 border rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Show Comments Button */}
            <button
              onClick={() => toggleComments(complaint._id)}
              className="mt-2 text-blue-500 text-sm"
            >
              {showComments[complaint._id] ? 'Hide Comments' : 'Show Comments'}
            </button>

            {/* Comments Section */}
            {showComments[complaint._id] && (
              <div className="mt-2 bg-gray-50 p-2 rounded">
                {complaint.comments.length > 0 ? (
                  complaint.comments.map((comment, index) => (
                    <p key={index} className="text-gray-700">
                      <strong>{comment.user}:</strong> {comment.text}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
      {icon}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;