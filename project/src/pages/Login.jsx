import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
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
      const response = await fetch('https://public-complient-websitw.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gradient colors for the background
  const gradientColors = isAdmin 
    ? 'from-indigo-600 to-purple-800' 
    : 'from-blue-600 to-teal-500';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${gradientColors} px-6 transition-colors duration-500`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 max-w-md w-full border border-white border-opacity-20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome to <span className="text-blue-200">ComplainIQ</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-100"
          >
            {isAdmin ? 'Administrator Access' : 'User Portal'}
          </motion.p>
        </div>

        <motion.div 
          className="flex justify-center mb-8 bg-white bg-opacity-20 rounded-xl overflow-hidden shadow-inner"
          whileHover={{ scale: 1.02 }}
        >
          <button
            onClick={() => setIsAdmin(false)}
            className={`w-1/2 py-3 text-sm font-medium transition-all duration-300 ${
              !isAdmin 
                ? 'bg-white text-blue-600 font-semibold' 
                : 'bg-transparent text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            User Login
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`w-1/2 py-3 text-sm font-medium transition-all duration-300 ${
              isAdmin 
                ? 'bg-white text-indigo-600 font-semibold' 
                : 'bg-transparent text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            Admin Login
          </button>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-blue-100 mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="w-full p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-300 hover:bg-opacity-20"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className="absolute right-3 top-4 text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-300 text-xs mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                className="w-full p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-300 hover:bg-opacity-20"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <div className="absolute right-3 top-4 text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-300 text-xs mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-2"
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isAdmin 
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-blue-100 text-sm mb-3">
            Demo credentials: <span className="font-mono bg-black bg-opacity-20 px-2 py-1 rounded">user1@gmail.com</span> / <span className="font-mono bg-black bg-opacity-20 px-2 py-1 rounded">123456</span>
          </p>
          <p className="text-blue-100">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-white font-semibold hover:underline transition-all hover:text-blue-200"
            >
              Register here
            </Link>
          </p>
        </motion.div>

        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -bottom-4 -right-4 bg-white bg-opacity-20 backdrop-blur-md rounded-full p-3 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Login;