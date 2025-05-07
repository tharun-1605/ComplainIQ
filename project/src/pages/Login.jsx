import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 px-4 sm:px-6 lg:px-8">
      <div className="relative bg-white/20 backdrop-blur-lg shadow-xl rounded-xl p-10 w-full max-w-md animate-fade-in-up">
        <h2 className="text-center text-3xl font-bold text-white mb-2">Welcome to ComplainIQ</h2>
        <p className="text-center text-white mb-6">Sign in to your account</p>

        <div className="flex mb-6 overflow-hidden rounded-lg border border-white/30">
          <button
            onClick={() => setIsAdmin(false)}
            className={`w-1/2 py-2 text-sm font-semibold transition-all ${
              !isAdmin ? 'bg-white text-blue-700 shadow-inner' : 'text-white hover:bg-white/10'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`w-1/2 py-2 text-sm font-semibold transition-all ${
              isAdmin ? 'bg-white text-blue-700 shadow-inner' : 'text-white hover:bg-white/10'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 bg-white/10 text-white placeholder-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 bg-white/10 text-white placeholder-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 mt-2 rounded-lg font-semibold transition-all ${
              isSubmitting
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-white text-blue-700 hover:bg-blue-100'
            }`}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/80">
          <p>
            Demo credentials: <strong>user1@gmail.com / 123456</strong>
          </p>
          <p className="mt-2">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-white hover:underline transition"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
