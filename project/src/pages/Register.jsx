import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, Image as ImageIcon } from 'lucide-react';

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
  const navigate = useNavigate();

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
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      const response = await fetch('https://public-complient-websitw.onrender.com0/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          profileImage: formData.profileImage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const inputStyle =
    'w-full p-3 pl-10 bg-transparent border border-white rounded-lg text-white placeholder-white focus:ring-2 focus:ring-blue-300 outline-none relative';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-6">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg shadow-2xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-white">Create an Account</h2>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="relative">
            <User className="absolute top-3 left-3 text-white" size={20} />
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              className={inputStyle}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute top-3 left-3 text-white" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className={inputStyle}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 text-white" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              className={inputStyle}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <span
              className="absolute top-3 right-3 text-white cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 text-white" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              className={inputStyle}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {/* Bio */}
          <textarea
            name="bio"
            placeholder="Tell us about yourself..."
            rows="3"
            className="w-full p-3 bg-transparent border border-white rounded-lg text-white placeholder-white focus:ring-2 focus:ring-blue-300 outline-none"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />

          {/* Profile Image Upload */}
          <div className="space-y-2">
            <label className="text-white flex items-center gap-2 font-medium">
              <ImageIcon size={20} /> Upload Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-white file:bg-white file:text-blue-700 file:rounded file:px-4 file:py-2 file:border-none"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover mt-2 border border-white"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-blue-100 transition-all"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          Already have an account?{' '}
          <Link to="/" className="text-blue-200 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
