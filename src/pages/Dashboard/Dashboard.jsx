import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, MoreVertical, User } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { ProductForm } from '../../components/ProductForm/ProductForm';

export const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts(searchTerm);
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [searchTerm]);

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                await loadProducts();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setActionLoading(true);
            if (selectedProduct) {
                await updateProduct(selectedProduct._id, formData);
            } else {
                await createProduct(formData);
            }
            setIsModalOpen(false);
            await loadProducts();
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="user-header">
                <div className="user-profile-wrapper">
                    <div className="avatar-circle">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="user-info">
                        <div className="user-name">Admin User</div>
                        <div className="user-email">admin@store.com</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-card">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Product Management</h1>
                        <p className="dashboard-subtitle">Manage your product catalog, inventory, and categories</p>
                    </div>
                    <button onClick={handleOpenAdd} className="btn-add-product">
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>

                <div className="controls-row">
                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-filter">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '5rem 0', textAlign: 'center', color: '#717182' }}>Loading products...</div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '5rem 0', textAlign: 'center', color: '#717182' }}>No products found.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '0.5rem' }}>Product</th>
                                    <th>Serie</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '0.5rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((prod) => (
                                    <tr key={prod._id}>
                                        <td style={{ paddingLeft: '0.5rem' }}>
                                            <div className="product-cell">
                                                <img
                                                    src={prod.image ? `http://localhost:4000${prod.image}` : 'https://via.placeholder.com/40'}
                                                    alt={prod.name}
                                                    className="product-img"
                                                />
                                                <span className="product-name">{prod.name}</span>
                                            </div>
                                        </td>
                                        <td className="serie-cell">{prod.serie}</td>
                                        <td className="category-cell">{prod.category}</td>
                                        <td className="price-cell">${Number(prod.price).toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${prod.status === 'active' ? 'active' : 'inactive'}`}>
                                                {prod.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="actions-wrapper">
                                                <button onClick={() => handleOpenEdit(prod)} className="action-btn">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(prod._id)} className="action-btn delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="action-btn">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="table-footer">
                    <div>Showing 1-{products.length} of {products.length} products</div>
                    <div className="pagination-controls">
                        <button className="btn-pagination">Previous</button>
                        <button className="btn-pagination">Next</button>
                    </div>
                </div>
            </div>

            <ProductForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedProduct}
                isLoading={actionLoading}
            />
        </div>
    );
};