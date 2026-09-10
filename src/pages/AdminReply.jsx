import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import { ShieldCheckIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { FiUpload, FiX } from 'react-icons/fi';

function AdminReply() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    image: '',
    video: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Official Admin Resolution | ComplainIQ";
  }, []);

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
      toast.error('Please enter an official response description');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const data = {
        description: formData.description,
        image: formData.image || null,
        video: formData.video || null,
      };

      await axios.post(`${API_BASE_URL}/admin/posts/${postId}/reply`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Official resolution reply transmitted successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-2xl relative z-10"
      >
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Admin Console
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Official Resolution Composer</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Replying to Complaint ID: <span className="font-mono text-indigo-400">#{postId ? postId.slice(-6) : 'N/A'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Official Statement / Action Taken <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm"
              placeholder="State the municipal investigation results, repairs completed, or administrative steps..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Resolution Photo Attachment <span className="text-gray-500 font-normal lowercase">(optional)</span>
            </label>
            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl glass-input border-dashed border-white/20 hover:border-indigo-500 cursor-pointer text-xs font-medium text-gray-300 transition-all">
              <FiUpload className="w-4 h-4 text-indigo-400" />
              <span>Attach Resolution Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="hidden"
              />
            </label>
            {formData.image && (
              <div className="mt-2 relative rounded-xl overflow-hidden max-h-36">
                <img src={formData.image} alt="Preview" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-rose-400"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Resolution Video Attachment <span className="text-gray-500 font-normal lowercase">(optional)</span>
            </label>
            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl glass-input border-dashed border-white/20 hover:border-indigo-500 cursor-pointer text-xs font-medium text-gray-300 transition-all">
              <FiUpload className="w-4 h-4 text-indigo-400" />
              <span>Attach Resolution Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="hidden"
              />
            </label>
            {formData.video && (
              <div className="mt-2 relative rounded-xl overflow-hidden max-h-36">
                <video controls className="w-full h-36 object-cover">
                  <source src={formData.video} type="video/mp4" />
                </video>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-slate-900 border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Transmitting Reply...' : 'Publish Official Reply'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminReply;