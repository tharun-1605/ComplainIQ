import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import { ShieldCheck, ArrowLeft, Image as ImageIcon, Video as VideoIcon, X, Loader2 } from 'lucide-react';

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
    document.title = "Official Admin Resolution • ComplainIQ";
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

      toast.success('Official resolution reply transmitted!');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0a0a0a] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Official Resolution Composer</h2>
          <p className="text-xs text-gray-400 font-mono">
            Complaint ID: <span className="text-emerald-400 font-bold">#{postId ? postId.slice(-6) : 'N/A'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Official Resolution Action <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full p-3 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors leading-relaxed"
              placeholder="State the municipal inspection findings, completed repairs, and resolution notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Proof Image Attachment
              </label>
              <label className="flex flex-col items-center justify-center h-28 rounded-xl bg-[#121212] border border-dashed border-[#363636] hover:border-gray-500 cursor-pointer transition-colors p-3">
                <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[11px] font-semibold text-gray-300">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="hidden"
                />
              </label>
              {formData.image && (
                <div className="mt-2 relative rounded-xl overflow-hidden max-h-28 border border-[#262626]">
                  <img src={formData.image} alt="Preview" className="w-full h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Proof Video Attachment
              </label>
              <label className="flex flex-col items-center justify-center h-28 rounded-xl bg-[#121212] border border-dashed border-[#363636] hover:border-gray-500 cursor-pointer transition-colors p-3">
                <VideoIcon className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[11px] font-semibold text-gray-300">Upload Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="hidden"
                />
              </label>
              {formData.video && (
                <div className="mt-2 relative rounded-xl overflow-hidden max-h-28 border border-[#262626]">
                  <video controls className="w-full h-28 object-cover">
                    <source src={formData.video} type="video/mp4" />
                  </video>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, video: '' }))}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-400 bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                'Publish Resolution'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminReply;