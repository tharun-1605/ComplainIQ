import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
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
    document.title = "Login • ComplainIQ";
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
        toast.success(isAdmin ? 'Admin authenticated!' : 'Welcome back!');
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
    <div className="min-h-screen relative flex items-center justify-center bg-black px-4 py-12 selection:bg-rose-500 selection:text-white">
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Main Card */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-lg">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <h2 data-testid="login-heading" className="text-2xl font-bold text-white tracking-tight font-sans">
              Complain<span className="text-sky-500">IQ</span>
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              {isAdmin ? 'Administrative Control Portal' : 'Civic Incident & Feed Portal'}
            </p>
          </div>

          {/* User vs Admin Role Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#121212] rounded-xl border border-[#262626]">
            <button
              type="button"
              data-testid="user-login-toggle"
              onClick={() => setIsAdmin(false)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                !isAdmin 
                  ? 'bg-[#262626] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Citizen
            </button>
            <button
              type="button"
              data-testid="admin-login-toggle"
              onClick={() => setIsAdmin(true)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isAdmin 
                  ? 'bg-sky-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Form */}
          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  data-testid="login-email"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <EnvelopeIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  data-testid="login-password"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <LockClosedIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
              {errors.password && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-800 cursor-not-allowed' 
                  : 'bg-sky-500 hover:bg-sky-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Fill Quick Options */}
          <div className="pt-4 border-t border-[#262626] text-center space-y-3">
            <div className="bg-[#121212] rounded-xl p-3 border border-[#262626] space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                ⚡ Quick Fill Demo Logins
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdmin(false);
                    setFormData({ email: 'user1@gmail.com', password: '123456' });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-sky-400 text-xs font-semibold border border-[#333] transition-all"
                >
                  👤 User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdmin(true);
                    setFormData({ email: 'admin@gmail.com', password: '123456' });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-purple-400 text-xs font-semibold border border-[#333] transition-all"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                data-testid="register-link"
                className="text-sky-400 font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Login;

