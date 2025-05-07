import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiMapPin, FiX, FiLoader, FiCheckCircle } from 'react-icons/fi';

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
    category: 'Others',
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to reverse geocode coordinates to address
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
      setLocationAddress("Location fetched (address not available)");
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
          
          // Get address from coordinates
          await reverseGeocode(latitude, longitude);
          
          toast.success('Location fetched successfully!');
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Failed to fetch location. Please allow location access.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please ensure your device location services are enabled.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while fetching location.';
              break;
          }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.content.trim()) {
      toast.error('Please enter your complaint');
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

      await axios.post('https://public-complient-websitw.onrender.com/api/posts', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Complaint posted successfully!');
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to post complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-lg"
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-white text-center mb-6"
        >
          Create a Complaint
        </motion.h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
              <span className="text-gray-500 text-xs ml-1">(optional)</span>
            </label>
            <input
              id="title"
              type="text"
              className="w-full p-3 mt-1 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={4}
              className="w-full p-3 mt-1 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Describe your complaint in detail..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 mt-1 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="Electric">Electric</option>
                <option value="Water">Water</option>
                <option value="Social Problem">Social Problem</option>
                <option value="Drainage">Drainage</option>
                <option value="Air">Air</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Upload Image <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200 border border-gray-600 border-dashed">
                    <FiUpload className="mr-2 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      {formData.image ? formData.image.name : 'Choose image...'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, image: file });
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null })}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Upload Video <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200 border border-gray-600 border-dashed">
                    <FiUpload className="mr-2 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      {formData.video ? formData.video.name : 'Choose video...'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, video: file });
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {formData.video && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, video: null })}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useCurrentLocation"
                checked={formData.useCurrentLocation}
                onChange={(e) => setFormData({ ...formData, useCurrentLocation: e.target.checked })}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                disabled={locationLoading}
              />
              <label htmlFor="useCurrentLocation" className="ml-2 text-sm font-medium text-gray-300 flex items-center">
                {locationLoading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Fetching location...
                  </>
                ) : (
                  <>
                    <FiMapPin className="mr-2 text-blue-400" />
                    Add current location
                  </>
                )}
              </label>
            </div>

            <AnimatePresence>
              {locationError && !locationLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-2 bg-red-900 bg-opacity-50 rounded-lg"
                >
                  <span className="text-sm text-red-300">{locationError}</span>
                  <button
                    type="button"
                    onClick={fetchLocation}
                    className="ml-3 px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Retry
                  </button>
                </motion.div>
              )}

              {(formData.latitude && formData.longitude && !locationLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-1">Location added</p>
                      {locationAddress ? (
                        <p className="text-xs text-gray-400 break-words">{locationAddress}</p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          useCurrentLocation: false,
                          latitude: null,
                          longitude: null
                        }));
                        setLocationAddress(null);
                      }}
                      className="ml-auto p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <FiX />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex justify-between pt-4"
          >
            <button
              type="button"
              onClick={() => navigate('/user-dashboard')}
              className="px-5 py-2.5 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-all duration-200 font-medium flex items-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-lg text-white font-bold transition-all duration-200 flex items-center ${
                isSubmitting 
                  ? 'bg-blue-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                'Post Complaint'
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default CreatePost;