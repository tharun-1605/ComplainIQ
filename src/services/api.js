import axios from 'axios';

// Detect whether running locally or on production
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
    }
    return 'https://public-complient-websitw.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (email, password) => api.post('/login', { email, password }),
    register: (formData) => api.post('/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getProfile: () => api.get('/profile'),
    getTotalLikes: (userId) => api.get(`/users/${userId}/likes`),
};

export const posts = {
    create: (formData) => api.post('/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getUserPosts: () => api.get('/user/posts'),
    getAll: () => api.get('/posts'),
    like: (postId) => api.post(`/posts/${postId}/like`),
    comment: (postId, comment) => api.post(`/posts/${postId}/comment`, { comment }),
    updateStatus: (postId, status) => api.put(`/user/complaints/${postId}/status`, { status }),
    delete: (postId) => api.delete(`/posts/${postId}`),
    getCompletedComplaints: () => api.get('/user/completed-complaints')
};

export default api;
