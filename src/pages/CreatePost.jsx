import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiMapPin, FiX, FiLoader, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../services/api';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const CATEGORY_OPTIONS = [
  { label: 'Infrastructure', value: 'Electric', icon: '⚡' },
  { label: 'Water Supply', value: 'Water', icon: '💧' },
  { label: 'Sanitation', value: 'Drainage', icon: '🧹' },
  { label: 'Public Safety', value: 'Social Problem', icon: '🛡️' },
  { label: 'Environment', value: 'Air', icon: '🌿' },
  { label: 'General / Other', value: 'Others', icon: '📌' },
];

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    video: null,
    latitude: null,
    longitude: null,
    useCurrentLocation: false,
    category: 'Electric',
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    document.title = "New Complaint | ComplainIQ";
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const address = response.data.display_name;
      setLocationAddress(address);
      return address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationAddress("GPS Coordinates acquired (Address lookup unavailable)");
      return null;
    }
  };

  const fetchLocation = async () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      setLocationError(null);
      setLocationAddress(null);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          await reverseGeocode(latitude, longitude);
          toast.success('GPS Location pinned successfully!');
          setLocationLoading(false);
        },
        (error) => {
          let errorMessage = 'Failed to fetch location. Please check browser permissions.';
          toast.error(errorMessage);
          setLocationError(errorMessage);
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      setFormData((prev) => ({ ...prev, useCurrentLocation: false }));
    }
  };

  useEffect(() => {
    if (formData.useCurrentLocation) {
      fetchLocation();
    } else {
      setLocationAddress(null);
    }
  }, [formData.useCurrentLocation]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.content.trim()) {
      toast.error('Please describe the complaint issue');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const imageBase64 = formData.image ? await toBase64(formData.image) : null;
      const videoBase64 = formData.video ? await toBase64(formData.video) : null;

      const payload = {
        title: formData.title,
        content: formData.content,
        image: imageBase64,
        video: videoBase64,
        category: formData.category,
      };

      if (formData.useCurrentLocation && formData.latitude && formData.longitude) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      await axios.post(`${API_BASE_URL}/posts`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Complaint submitted successfully!');
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to post complaint. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Back Link & Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/user-dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Feed
          </button>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            Public Incident Report
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-bg mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">File a Public Complaint</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Provide incident details to notify city administration & track public progress
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Subject Title <span className="text-gray-500 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 glass-input rounded-xl text-sm"
                placeholder="e.g. Broken Water Main on 5th Avenue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Category Selection Grid */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Incident Category <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      formData.category === cat.value
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900/60 border-white/5 text-gray-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content / Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 glass-input rounded-xl text-sm"
                placeholder="Describe the problem, precise location markers, safety hazards, and impact..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            {/* Attachments Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Photo Evidence
                </label>
                <div className="relative">
                  <label className="flex items-center justify-center gap-2 p-4 rounded-xl glass-input border-dashed border-white/20 hover:border-indigo-500 cursor-pointer text-xs font-medium text-gray-300 transition-all">
                    <FiUpload className="w-4 h-4 text-indigo-400" />
                    <span>{formData.image ? formData.image.name : 'Attach Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="mt-2 relative rounded-xl overflow-hidden max-h-32">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: null });
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-rose-400"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Video Clip <span className="text-gray-500 font-normal lowercase">(optional)</span>
                </label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl glass-input border-dashed border-white/20 hover:border-indigo-500 cursor-pointer text-xs font-medium text-gray-300 transition-all">
                  <FiUpload className="w-4 h-4 text-indigo-400" />
                  <span>{formData.video ? formData.video.name : 'Attach Video MP4'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setFormData({ ...formData, video: file });
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useCurrentLocation}
                    onChange={(e) => setFormData({ ...formData, useCurrentLocation: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FiMapPin className="text-indigo-400" /> Attach Current Geolocation (GPS)
                  </span>
                </label>
              </div>

              <AnimatePresence>
                {locationLoading && (
                  <p className="text-xs text-indigo-300 flex items-center gap-2">
                    <FiLoader className="animate-spin" /> Acquiring precise GPS coordinates...
                  </p>
                )}
                {locationAddress && !locationLoading && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{locationAddress}</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => navigate('/user-dashboard')}
                className="px-5 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-slate-900 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-bg shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" /> Submitting Report...
                  </>
                ) : (
                  'Submit Official Report'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default CreatePost;