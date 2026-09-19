const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/products';

export const fetchProducts = async (search = '', category = '', status = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);

    const res = await fetch(`${API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
};

// ADD THIS EXPORT FUNCTION:
export const getProductById = async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
};

export const createProduct = async (formData) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
};

export const updateProduct = async (id, formData) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
};

export const deleteProduct = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
};