import axios from 'axios';

export const API_URL = 'http://localhost:4000';

export const api = axios.create({
    baseURL: API_URL,
});

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return imagePath.startsWith('/') ? `${API_URL}${imagePath}` : `${API_URL}/${imagePath}`;
};

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => (
    error.response?.data?.message || error.response?.data?.error || error.message || fallback
);