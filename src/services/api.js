// src/services/api.js
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://lightsteelblue-llama-701240.hostingersite.com';

// Axios Instance
export const api = axios.create({
    baseURL: BACKEND_URL,
});

// Helper to construct clean image URLs
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:'))) {
        return imagePath;
    }

    let cleanPath = String(imagePath).replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
    }

    return `${BACKEND_URL}${cleanPath}`;
};

// Helper to extract clean error messages from Axios / API responses
export const getErrorMessage = (error, fallbackMessage = 'An unexpected error occurred.') => {
    if (!error) return fallbackMessage;

    // Axios response error from backend (e.g. res.status(400).json({ message: '...' }))
    if (error.response && error.response.data) {
        return error.response.data.message || error.response.data.error || fallbackMessage;
    }

    // Network error or standard JS Error object
    if (error.message) {
        return error.message;
    }

    // Direct string error
    if (typeof error === 'string') {
        return error;
    }

    return fallbackMessage;
};

export default api;