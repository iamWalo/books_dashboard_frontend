const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://lightsteelblue-llama-701240.hostingersite.com';

export const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};