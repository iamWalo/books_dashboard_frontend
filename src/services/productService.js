import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
});

const getList = (response) => response.data?.data || response.data?.products || response.data || [];

export const fetchProducts = async (searchTerm = '') => {
    const response = await api.get('/api/products', {
        params: searchTerm ? { search: searchTerm } : undefined,
    });
    return getList(response);
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await api.post('/api/products', formData);
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await api.put(`/api/products/${id}`, formData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
};

export const getImageUrl = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${api.defaults.baseURL}${image}`;
};

export const productService = {
    getProducts: fetchProducts,
    getCategories: async () => getList(await api.get('/api/categories')),
    getSeries: async () => getList(await api.get('/api/series')),
    getBooks: fetchProducts,
    createProduct,
};