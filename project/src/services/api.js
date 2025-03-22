import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (email, password) => api.post('/login', { email, password }),
    register: (username, email, password) => api.post('/register', { username, email, password }),
    getProfile: () => api.get('/profile')
};

export const posts = {
    create: (title, content) => api.post('/posts', { title, content }),
    getAll: () => api.get('/posts')
};

export default api;
