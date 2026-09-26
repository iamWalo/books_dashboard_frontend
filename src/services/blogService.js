import { api } from './api';

const getData = (response) => response.data?.data || [];
const getError = (response) => response.data?.message || response.data?.error || 'The request failed.';
const ensureSuccess = (response) => {
    if (response.data?.success === false) throw new Error(getError(response));
    return response.data;
};

export const blogService = {
    getAllBlogs: async (searchTerm = '') => {
        const response = await api.get('/api/blogs', {
            params: searchTerm ? { search: searchTerm } : undefined,
        });
        return { ...ensureSuccess(response), data: getData(response) };
    },

    createBlog: async (blogData) => {
        return ensureSuccess(await api.post('/api/blogs', blogData)).data;
    },

    getBlogById: async (id) => {
        return ensureSuccess(await api.get(`/api/blogs/${id}`)).data;
    },

    updateBlog: async (id, blogData) => {
        return ensureSuccess(await api.put(`/api/blogs/${id}`, blogData)).data;
    },

    deleteBlog: async (id) => {
        return ensureSuccess(await api.delete(`/api/blogs/${id}`));
    },

    createCategory: async (categoryData) => {
        return ensureSuccess(await api.post('/api/blogs/categories', categoryData));
    },

    getCategories: async () => {
        return getData(await api.get('/api/blogs/categories'));
    },
};