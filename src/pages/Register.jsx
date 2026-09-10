import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profileImage: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | ComplainIQ";
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPreviewImage(imageURL);
      setFormData({ ...formData, profileImage: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('bio', formData.bio);
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Registration successful! Welcome to ComplainIQ');
        navigate('/user-dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background light blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="text-center mb-8">
            <h2 data-testid="register-heading" className="text-3xl font-extrabold text-white tracking-tight">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Join <span className="text-indigo-400 font-semibold">ComplainIQ</span> to report civic issues and track resolutions in real time
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  data-testid="register-username"
                  placeholder="johndoe"
                  required
                  className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  data-testid="register-email"
                  placeholder="john@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    data-testid="register-password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-10 py-3 glass-input rounded-xl text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    data-testid="register-confirm-password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Short Bio</label>
              <textarea
                name="bio"
                placeholder="Active citizen interested in urban development..."
                rows="2"
                className="w-full px-4 py-3 glass-input rounded-xl text-sm"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            {/* Profile Picture Uploader */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Profile Avatar (Optional)</label>
              <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-semibold cursor-pointer border border-indigo-500/30 transition-all">
                  <ImageIcon size={16} />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Avatar preview"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No file selected</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-4 rounded-xl font-bold text-sm text-white gradient-bg shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                'Create Citizen Account'
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Already registered?{' '}
              <Link 
                to="/" 
                className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
