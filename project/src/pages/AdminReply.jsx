import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function AdminReply() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    image: '',
    video: '',
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const data = {
        description: formData.description,
        image: formData.image || null,
        video: formData.video || null,
      };

      await axios.post(`https://public-complient-websitw.onrender.com/api/admin/posts/${postId}/reply`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Reply sent successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-10 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Send Reply</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-300">Description</label>
            <textarea
              id="description"
              rows={4}
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your reply..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-gray-300">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-2 rounded-lg max-h-48 object-cover" />
            )}
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-semibold text-gray-300">Upload Video (Optional)</label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video')}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.video && (
              <video controls className="mt-2 rounded-lg max-h-48 w-full">
                <source src={formData.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="px-5 py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition font-bold"
            >
              Send Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminReply;