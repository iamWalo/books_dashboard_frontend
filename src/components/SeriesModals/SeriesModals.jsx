import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, X } from 'lucide-react';
import './SeriesModals.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const SerieFormModal = ({ isOpen, onClose, serie, availableBooks = [], onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (serie) {
            setName(serie.name || '');
            setDescription(serie.description || '');
            setSelectedBooks(serie.books || []);
        } else {
            setName('');
            setDescription('');
            setSelectedBooks([]);
        }
        setImage(null);
    }, [serie, isOpen]);

    if (!isOpen) return null;

    // Filter out books already selected for this serie
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
            formData.append('books', JSON.stringify(selectedBooks.map((b) => b._id || b)));
            if (image) {
                formData.append('image', image);
            }

            if (serie && serie._id) {
                await axios.put(`${API_BASE_URL}/api/series/${serie._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(`${API_BASE_URL}/api/series`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            onSave();
            onClose();
        } catch (err) {
            console.error('Error saving serie:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="serie-modal-overlay">
            <div className="serie-modal-container">
                <div className="serie-modal-header">
                    <h2>{serie ? 'Edit Serie' : 'Add Serie'}</h2>
                    <button className="serie-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="serie-form">
                    <div className="serie-form-group">
                        <label>Serie Name</label>
                        <input
                            type="text"
                            placeholder="Enter serie name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="serie-form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Enter description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="serie-form-group">
                        <label>Image</label>
                        <div className="serie-upload-box">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                            <p>Click to upload or drag and drop</p>
                            <small>PNG, JPG up to 10MB</small>
                        </div>
                    </div>

                    <div className="serie-form-group">
                        <label>Add Books</label>
                        <select onChange={handleSelectBook} value="">
                            <option value="" disabled>Choose a Book</option>
                            {unselectedBooks.map((book) => (
                                <option key={book._id} value={book._id}>{book.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedBooks.length > 0 && (
                        <div className="serie-books-list-preview">
                            <p className="books-list-title"><BookOpen size={16} /> Books in this serie:</p>
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

                    <div className="serie-form-actions">
                        <button type="button" className="btn-serie-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-serie-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Done!'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const AddBookToSerieModal = ({ isOpen, onClose, serie, availableBooks = [], onSave }) => {
    const [selectedBookId, setSelectedBookId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !serie) return null;

    // Filter out books that are already attached to this serie
    const unaddedBooks = availableBooks.filter(
        (book) => !(serie.books || []).some((b) => (b._id || b) === book._id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBookId) return;
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/series/${serie._id}/books`, { bookId: selectedBookId });
            setSelectedBookId('');
            onSave();
            onClose();
        } catch (err) {
            console.error('Error adding book to serie:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="serie-modal-overlay">
            <div className="serie-modal-container compact">
                <div className="serie-modal-header">
                    <h2>Add New Book</h2>
                    <button className="serie-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="serie-form">
                    <div className="serie-form-group">
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

                    <div className="serie-books-list-preview">
                        <p className="books-list-title"><BookOpen size={16} /> Books in this serie:</p>
                        <ul>
                            {(serie.books || []).map((b) => (
                                <li key={b._id || b}>
                                    <span>• {b.name || 'Book'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="serie-form-actions">
                        <button type="button" className="btn-serie-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-serie-submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Done!'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};