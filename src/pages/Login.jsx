import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | ComplainIQ";
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email address';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success(isAdmin ? 'Admin authenticated successfully!' : 'Welcome back!');
        navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Unable to connect to server. Please ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg shadow-lg shadow-indigo-500/30 mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h2 data-testid="login-heading" className="text-3xl font-extrabold text-white tracking-tight">
              Complain<span className="gradient-text">IQ</span>
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              {isAdmin ? 'Administrator Management Portal' : 'Public Civic Complaint Portal'}
            </p>
          </div>

          {/* User vs Admin Role Switcher */}
          <div className="grid grid-cols-2 p-1.5 mb-8 bg-slate-900/80 rounded-2xl border border-white/10 relative">
            <button
              type="button"
              data-testid="user-login-toggle"
              onClick={() => setIsAdmin(false)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                !isAdmin 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              User Portal
            </button>
            <button
              type="button"
              data-testid="admin-login-toggle"
              onClick={() => setIsAdmin(true)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                isAdmin 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Admin Portal
            </button>
          </div>

          {/* Form */}
          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  data-testid="login-email"
                  className="w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-sm"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  data-testid="login-password"
                  className="w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>

            <motion.button
              type="submit"
              data-testid="login-submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : isAdmin 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 space-y-2">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                ⚡ Quick Fill Demo Account
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdmin(false);
                    setFormData({ email: 'user1@gmail.com', password: '123456' });
                  }}
                  className="py-2 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition-all flex items-center justify-center gap-1"
                >
                  👤 Fill User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdmin(true);
                    setFormData({ email: 'admin@gmail.com', password: '123456' });
                  }}
                  className="py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all flex items-center justify-center gap-1"
                >
                  🛡️ Fill Admin
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-mono pt-1">
                Password for both: <span className="text-indigo-400 font-bold">123456</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                data-testid="register-link"
                className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Login;
