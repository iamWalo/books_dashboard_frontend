import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, X } from 'lucide-react';
import { getErrorMessage } from '../../services/api';
import './CategoryModals.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const CategoryFormModal = ({ isOpen, onClose, category, availableBooks = [], onSave, onSuccess, onError }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#0F4000');
    const [image, setImage] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setDescription(category.description || '');
            setColor(category.color || '#0F4000');
            setSelectedBooks(category.books || []);
        } else {
            setName('');
            setDescription('');
            setColor('#0F4000');
            setSelectedBooks([]);
        }
        setImage(null);
    }, [category, isOpen]);

    if (!isOpen) return null;

    // Filter out already selected books for this category
    const unselectedBooks = availableBooks.filter(
        (book) => !selectedBooks.some((b) => (b._id || b) === book._id)
    );

    const handleSelectBook = (e) => {
        const bookId = e.target.value;
        if (bookId) {
            const found = availableBooks.find((b) => b._id === bookId);
            if (found) {
                setSelectedBooks([...selectedBooks, found]);
            }
        }
    };

    const handleRemoveBook = (bookId) => {
        setSelectedBooks(selectedBooks.filter((b) => (b._id || b) !== bookId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('color', color);
            formData.append('books', JSON.stringify(selectedBooks.map((b) => b._id || b)));
            if (image) {
                formData.append('image', image);
            }

            if (category && category._id) {
                await axios.put(`${API_BASE_URL}/api/categories/${category._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(`${API_BASE_URL}/api/categories`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            await onSave();
            onSuccess?.('Category saved successfully.');
            onClose();
        } catch (err) {
            onError?.(getErrorMessage(err, 'Could not save the category.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cat-modal-overlay">
            <div className="cat-modal-container">
                <div className="cat-modal-header">
                    <h2>{category ? 'Edit Category' : 'Add Category'}</h2>
                    <button className="cat-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="cat-form">
                    <div className="cat-form-group">
                        <label>Category Name</label>
                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="cat-form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Enter category description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="cat-form-group">
                        <label>Choose Color Category</label>
                        <div className="color-picker-input">
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="color-box-swatch"
                            />
                        </div>
                    </div>

                    <div className="cat-form-group">
                        <label>Image</label>
                        <div className="cat-upload-box">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                            <p>Click to upload or drag and drop</p>
                            <small>PNG, JPG up to 10MB</small>
                        </div>
                    </div>

                    {/* Book Select Field */}
                    <div className="cat-form-group">
                        <label>Add Books</label>
                        <select onChange={handleSelectBook} value="">
                            <option value="" disabled>Choose a Book</option>
                            {unselectedBooks.map((book) => (
                                <option key={book._id} value={book._id}>{book.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedBooks.length > 0 && (
                        <div className="cat-books-list-preview">
                            <p className="books-list-title"><BookOpen size={16} /> Books in this category:</p>
                            <ul>
                                {selectedBooks.map((b) => (
                                    <li key={b._id || b}>
                                        <span>• {b.name || 'Selected Book'}</span>
                                        <button type="button" onClick={() => handleRemoveBook(b._id || b)}>&times;</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="cat-form-actions">
                        <button type="button" className="btn-cat-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-cat-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Done!'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const AddBookToCategoryModal = ({ isOpen, onClose, category, availableBooks = [], onSave, onSuccess, onError }) => {
    const [selectedBookId, setSelectedBookId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !category) return null;

    const unaddedBooks = availableBooks.filter(
        (book) => !(category.books || []).some((b) => (b._id || b) === book._id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBookId) return;
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/categories/${category._id}/books`, { bookId: selectedBookId });
            setSelectedBookId('');
            await onSave();
            onSuccess?.('Book added to category successfully.');
            onClose();
        } catch (err) {
            onError?.(getErrorMessage(err, 'Could not add the book to this category.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cat-modal-overlay">
            <div className="cat-modal-container compact">
                <div className="cat-modal-header">
                    <h2>Add New Book</h2>
                    <button className="cat-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="cat-form">
                    {/* Book Select Field */}
                    <div className="cat-form-group">
                        <label>Select book</label>
                        <select
                            value={selectedBookId}
                            onChange={(e) => setSelectedBookId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Choose book</option>
                            {unaddedBooks.map((book) => (
                                <option key={book._id} value={book._id}>{book.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cat-books-list-preview">
                        <p className="books-list-title"><BookOpen size={16} /> Books in this category:</p>
                        <ul>
                            {(category.books || []).map((b) => (
                                <li key={b._id || b}>
                                    <span>• {b.name || 'Book'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="cat-form-actions">
                        <button type="button" className="btn-cat-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-cat-submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Done!'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};