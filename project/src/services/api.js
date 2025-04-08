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
    register: (username, email, password, bio, profileImage) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('bio', bio);
        formData.append('profileImage', profileImage);
        return api.post('/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getProfile: () => api.get('/profile'),
    getTotalLikes: (userId) => api.get(`/users/${userId}/likes`), // New method to fetch total likes
};

export const posts = {
    create: (formData) => api.post('/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getAll: () => api.get('/posts')
};

export default api;
