import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, MoreVertical, User } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { ProductForm } from '../../components/ProductForm/ProductForm';
import { getErrorMessage, getImageUrl } from '../../services/api';
import ConfirmModal from '../../components/Feedback/ConfirmModal';
import useFeedback from '../../components/Feedback/useFeedback';

export const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { showSuccess, showError, toastElement } = useFeedback();

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await fetchProducts(searchTerm);
            setProducts(data);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load products.'));
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

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const result = await deleteProduct(productToDelete);
            await loadProducts();
            setProductToDelete(null);
            showSuccess(result?.message || 'Product deleted successfully.');
        } catch (err) {
            showError(getErrorMessage(err, 'Could not delete the product.'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setActionLoading(true);
            if (selectedProduct) {
                const result = await updateProduct(selectedProduct._id, formData);
                showSuccess(result?.message || 'Product updated successfully.');
            } else {
                const result = await createProduct(formData);
                showSuccess(result?.message || 'Product created successfully.');
            }
            setIsModalOpen(false);
            await loadProducts();
        } catch (err) {
            showError(getErrorMessage(err, 'Could not save the product.'));
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

                {error && <div style={{ padding: '1rem', color: '#b42318' }}>{error}</div>}
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
                                                    src={getImageUrl(prod.image || prod.productImages?.[0]) || 'https://via.placeholder.com/40'}
                                                    alt={prod.name}
                                                    className="product-img"
                                                />
                                                <span className="product-name">{prod.name}</span>
                                            </div>
                                        </td>
                                        <td className="serie-cell">{prod.serie?.name || prod.serie || '-'}</td>
                                        <td className="category-cell">{prod.category?.name || prod.category || '-'}</td>
                                        <td className="price-cell">${Number(prod.price).toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${prod.status === 'In Stock' ? 'active' : 'inactive'}`}>
                                                {prod.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="actions-wrapper">
                                                <button onClick={() => handleOpenEdit(prod)} className="action-btn">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setProductToDelete(prod._id)} className="action-btn delete">
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
                onError={showError}
            />
            {toastElement}
            <ConfirmModal
                isOpen={Boolean(productToDelete)}
                title="Delete product?"
                message="This product will be permanently removed from the catalog."
                onCancel={() => setProductToDelete(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
};