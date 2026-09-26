import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { CategoryFormModal, AddBookToCategoryModal } from '../../components/CategoryModals/CategoryModals';
import { productService } from '../../services/productService';
import { api, getErrorMessage, getImageUrl } from '../../services/api';
import ConfirmModal from '../../components/Feedback/ConfirmModal';
import useFeedback from '../../components/Feedback/useFeedback';
import './CategoriesPage.css';

const getReferenceId = (value) => {
    if (!value) return '';
    if (typeof value === 'object') return value._id || value.id || '';
    return value;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookToRemove, setBookToRemove] = useState(null);
    const [removeLoading, setRemoveLoading] = useState(false);
    const { showSuccess, showError, toastElement } = useFeedback();

    const fetchCategoriesAndBooks = async () => {
        try {
            setLoading(true);
            setError('');
            const [categoriesData, booksData] = await Promise.all([
                productService.getCategories(),
                productService.getBooks(),
            ]);
            setCategories(categoriesData);
            setAvailableBooks(booksData);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load categories and products.'));
        } finally {
            setLoading(false);
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

    const getCategoryBooks = (category) => {
        const categoryId = String(category._id);
        const selectedBooks = availableBooks.filter(
            (book) => String(getReferenceId(book.category)) === categoryId
        );
        const selectedBookIds = new Set(selectedBooks.map((book) => String(book._id)));
        const legacyBooks = (category.books || []).filter(
            (book) => !selectedBookIds.has(String(getReferenceId(book)))
        );

        return [...selectedBooks, ...legacyBooks];
    };

    const handleRemoveBookFromCategory = async () => {
        const { categoryId, bookId } = bookToRemove;
        setRemoveLoading(true);
        try {
            const result = await api.delete(`/api/categories/${categoryId}/books/${bookId}`);
            await fetchCategoriesAndBooks();
            setBookToRemove(null);
            showSuccess(result.data?.message || 'Book removed from category.');
        } catch (err) {
            showError(getErrorMessage(err, 'Could not remove the book from this category.'));
        } finally {
            setRemoveLoading(false);
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
                {loading ? <p>Loading categories...</p> : error ? <p>{error}</p> : categories.length === 0 ? <p>No categories found.</p> : categories.map((cat) => (
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
                            {getCategoryBooks(cat).length > 0 ? (
                                getCategoryBooks(cat).map((book) => (
                                    <div key={book._id} className="book-item">
                                        <div className="book-info">
                                            <img
                                                src={book.image ? getImageUrl(book.image) : 'https://via.placeholder.com/32'}
                                                alt={book.name}
                                                className="book-thumb"
                                            />
                                            <span className="book-title">{book.name}</span>
                                        </div>
                                        <button
                                            className="delete-book-btn"
                                            onClick={() => setBookToRemove({ categoryId: cat._id, bookId: book._id })}
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
                onSuccess={() => showSuccess('Category saved successfully.')}
                onError={(message) => showError(message)}
            />

            <AddBookToCategoryModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                category={selectedCategory}
                availableBooks={availableBooks}
                onSave={fetchCategoriesAndBooks}
                onSuccess={() => showSuccess('Book added to category successfully.')}
                onError={(message) => showError(message)}
            />
            {toastElement}
            <ConfirmModal
                isOpen={Boolean(bookToRemove)}
                title="Remove book from category?"
                message="The book will be removed from this category."
                onCancel={() => setBookToRemove(null)}
                onConfirm={handleRemoveBookFromCategory}
                loading={removeLoading}
            />
        </div>
    );
}