import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../services/api';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  MapPin, 
  X, 
  Loader2, 
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Send,
  Plus
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { label: 'Electricity', value: 'Electric', emoji: '⚡' },
  { label: 'Water Supply', value: 'Water', emoji: '💧' },
  { label: 'Sanitation', value: 'Drainage', emoji: '🧹' },
  { label: 'Public Safety', value: 'Social Problem', emoji: '🛡️' },
  { label: 'Environment', value: 'Air', emoji: '🌿' },
  { label: 'General / Other', value: 'Others', emoji: '📌' },
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
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    document.title = "Create New Post • ComplainIQ";
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
      setLocationAddress("GPS Coordinates attached");
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
          toast.success('GPS location attached');
          setLocationLoading(false);
        },
        (error) => {
          let errorMessage = 'Failed to fetch location. Check browser permissions.';
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, video: file });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.content.trim()) {
      toast.error('Please add a caption describing the issue');
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

      toast.success('Complaint posted to feed!');
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to post complaint. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-rose-500 selection:text-white pb-16 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-0 sm:px-4 py-4 space-y-4">
        
        {/* Composer Card Header */}
        <div className="bg-[#0a0a0a] border border-[#262626] sm:rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Top Bar */}
          <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/user-dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-white tracking-tight">Create new post</h1>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-xs font-bold text-sky-500 hover:text-sky-400 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Sharing...' : 'Share'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            
            {/* Category Select Pills */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Category
              </label>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-custom pb-1">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-white text-black font-bold shadow-md'
                          : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Title */}
            <div>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="Title / Summary (e.g. Water leak on main street)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Caption Textarea */}
            <div>
              <textarea
                rows={4}
                className="w-full p-3 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors leading-relaxed"
                placeholder="Write a caption... Describe the civic issue, location markers, and urgency #civic #fix"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            {/* Media Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Photo Evidence
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-[#121212] border border-[#262626]">
                    <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: null });
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-xl bg-[#121212] border border-dashed border-[#363636] hover:border-gray-500 cursor-pointer transition-colors p-4">
                    <ImageIcon className="w-6 h-6 text-gray-400 mb-1.5" />
                    <span className="text-xs font-semibold text-gray-300">Add Photo</span>
                    <span className="text-[10px] text-gray-500">JPG, PNG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Video Clip <span className="text-gray-600 font-normal lowercase">(optional)</span>
                </label>
                {videoPreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-[#121212] border border-[#262626]">
                    <video controls className="w-full h-36 object-cover">
                      <source src={videoPreview} type="video/mp4" />
                    </video>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, video: null });
                        setVideoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-xl bg-[#121212] border border-dashed border-[#363636] hover:border-gray-500 cursor-pointer transition-colors p-4">
                    <VideoIcon className="w-6 h-6 text-gray-400 mb-1.5" />
                    <span className="text-xs font-semibold text-gray-300">Add Video</span>
                    <span className="text-[10px] text-gray-500">MP4 format</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Location Attachment */}
            <div className="p-3 bg-[#121212] border border-[#262626] rounded-xl space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useCurrentLocation}
                  onChange={(e) => setFormData({ ...formData, useCurrentLocation: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#1e1e1e] border-[#363636] text-sky-500 focus:ring-0"
                />
                <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" /> Tag Current GPS Location
                </span>
              </label>

              <AnimatePresence>
                {locationLoading && (
                  <p className="text-[11px] text-sky-400 flex items-center gap-2 pt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Acquiring satellite location...
                  </p>
                )}
                {locationAddress && !locationLoading && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{locationAddress}</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/user-dashboard')}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-400 bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  'Share Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreatePost;