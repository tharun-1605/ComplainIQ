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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-gray-600 px-6">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg shadow-2xl rounded-2xl p-8 max-w-md w-full transition-all transform hover:scale-105">
        <h2 className="text-center text-3xl font-extrabold text-white animate-fade-in">Welcome Back to ComplainIQ</h2>
        <p className="text-center text-white mb-6">Sign in to your account</p>

        <div className="flex justify-center mb-6 bg-white bg-opacity-30 rounded-lg transition-all">
          <button
            onClick={() => setIsAdmin(false)}
            className={`w-1/2 py-2 text-sm font-medium rounded-l-lg transition ${
              !isAdmin ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-white'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`w-1/2 py-2 text-sm font-medium rounded-r-lg transition ${
              isAdmin ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-white'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 bg-transparent border border-white rounded-lg text-white placeholder-white focus:ring-2 focus:ring-blue-300 outline-none transition-all hover:shadow-md"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-white">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 bg-transparent border border-white rounded-lg text-white placeholder-white focus:ring-2 focus:ring-blue-300 outline-none transition-all hover:shadow-md"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 mt-4 text-blue-700 font-semibold rounded-lg shadow-md transition-all ${
              isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-blue-100'
            }`}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-black mt-4">
        Demo login credentials: <strong>Email:user@gmail.com,pass:123456</strong>
          Don't have an account?{' '}
          <Link to="/register" className="text-black-200 font-semibold hover:underline transition-all">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
