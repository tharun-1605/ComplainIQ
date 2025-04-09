import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    title: '',
    content: '',
    image: '',
    video: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Please enter your complaint');
      return;
    }
    try {
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
            if (formData.video) {
                formDataToSend.append('video', formData.video);
            }
            await axios.post('https://public-complient-websitw.onrender.com/api/posts', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Complaint posted successfully!');
      navigate('/user-dashboard');
    } catch (error) {
      toast.error('Failed to post complaint. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-10 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create a Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-300">Title</label>
            <input
              id="title"
              type="text"
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-300">Description</label>
            <textarea
              id="content"
              rows={4}
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your complaint..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-gray-300">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                }
              }}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="video" className="block text-sm font-semibold text-gray-300">Upload Video (Optional)</label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, video: file });
                }
              }}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/user-dashboard')}
              className="px-5 py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition font-bold"
            >
              Post Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
