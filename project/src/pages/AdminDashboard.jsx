import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, FlagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function AdminDashboard() {
const [complaints, setComplaints] = useState([]);


  const handleStatusChange = (complaintId, newStatus) => {
    setComplaints(complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return { ...complaint, status: newStatus };
      }
      return complaint;
    }));
  };

  const handlePriorityChange = (complaintId, newPriority) => {
    setComplaints(complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return { ...complaint, priority: newPriority };
      }
      return complaint;
    }));
  };

  // Sort complaints by likes (priority)
  const sortedComplaints = [...complaints].sort((a, b) => b.likes - a.likes);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Complaints List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Complaints Management</h2>
            <p className="mt-1 text-sm text-gray-500">Sorted by number of likes (priority)</p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {sortedComplaints.map(complaint => (
                <li key={complaint.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={complaint.user.avatar}
                        alt={complaint.user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{complaint.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={complaint.priority}
                        onChange={(e) => handlePriorityChange(complaint.id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-900">{complaint.content}</p>
                    {complaint.image && (
                      <img
                        src={complaint.image}
                        alt="Complaint"
                        className="mt-2 h-48 w-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span className="mr-4">👍 {complaint.likes} likes</span>
                    <span>💬 {complaint.comments} comments</span>
                  </div>
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
