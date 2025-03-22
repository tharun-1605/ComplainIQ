import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    content: '',
    image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Please enter your complaint');
      return;
    }
    // TODO: Implement post creation logic
    toast.success('Complaint posted successfully!');
    navigate('/user-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Create New Complaint</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe your complaint..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Image URL (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="image"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/user-dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Post Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;