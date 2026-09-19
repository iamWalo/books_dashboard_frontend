import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { CategoryFormModal, AddBookToCategoryModal } from '../../components/CategoryModals/CategoryModals';
import './CategoriesPage.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategoriesAndBooks = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/categories`),
                axios.get(`${API_BASE_URL}/api/products`),
            ]);
            setCategories(catRes.data.data || []);
            setAvailableBooks(prodRes.data.data || prodRes.data.products || []);
        } catch (err) {
            console.error('Failed to load categories or products:', err);
        }
    };

    useEffect(() => {
        fetchCategoriesAndBooks();
    }, []);

    const handleOpenAddCategory = () => {
        setSelectedCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleOpenEditCategory = (category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleOpenAddBook = (category) => {
        setSelectedCategory(category);
        setIsAddBookModalOpen(true);
    };

    const handleRemoveBookFromCategory = async (categoryId, bookId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/categories/${categoryId}/books/${bookId}`);
            fetchCategoriesAndBooks();
        } catch (err) {
            console.error('Failed to remove book:', err);
        }
    };

    return (
        <div className="categories-page">
            <div className="cat-header-row">
                <div>
                    <h1>Catgories</h1>
                    <p>Manage your categories from here</p>
                </div>
                <button className="btn-add-category" onClick={handleOpenAddCategory}>
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="categories-grid">
                {categories.map((cat) => (
                    <div key={cat._id} className="category-card">
                        <div
                            className="category-card-header"
                            style={{ backgroundColor: cat.color || '#0F4000' }}
                        >
                            <h3>{cat.name}</h3>
                            <button
                                className="edit-cat-btn"
                                onClick={() => handleOpenEditCategory(cat)}
                                title="Edit Category"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>

                        <div className="category-card-body">
                            {cat.books && cat.books.length > 0 ? (
                                cat.books.map((book) => (
                                    <div key={book._id} className="book-item">
                                        <div className="book-info">
                                            <img
                                                src={book.image ? `${API_BASE_URL}${book.image}` : 'https://via.placeholder.com/32'}
                                                alt={book.name}
                                                className="book-thumb"
                                            />
                                            <span className="book-title">{book.name}</span>
                                        </div>
                                        <button
                                            className="delete-book-btn"
                                            onClick={() => handleRemoveBookFromCategory(cat._id, book._id)}
                                            title="Remove Book"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-books-text">No books added yet.</p>
                            )}

                            <div className="add-book-footer">
                                <button
                                    className="btn-add-book"
                                    onClick={() => handleOpenAddBook(cat)}
                                >
                                    <Plus size={14} /> add a Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CategoryFormModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategory}
                availableBooks={availableBooks}
                onSave={fetchCategoriesAndBooks}
            />

            <AddBookToCategoryModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                category={selectedCategory}
                availableBooks={availableBooks}
                onSave={fetchCategoriesAndBooks}
            />
        </div>
    );
}