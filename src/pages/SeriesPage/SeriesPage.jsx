import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { SerieFormModal, AddBookToSerieModal } from '../../components/SeriesModals/SeriesModals';
import { productService } from '../../services/productService';
import './SeriesPage.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const SeriesPage = () => {
    const [series, setSeries] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [isSerieModalOpen, setIsSerieModalOpen] = useState(false);
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [selectedSerie, setSelectedSerie] = useState(null);

    const fetchSeriesAndBooks = async () => {
        try {
            const [seriesData, booksData] = await Promise.all([
                productService.getSeries(),
                productService.getBooks(),
            ]);
            setSeries(seriesData);
            setAvailableBooks(booksData);
        } catch (err) {
            console.error('Failed to load series or products:', err);
        }
    };

    useEffect(() => {
        fetchSeriesAndBooks();
    }, []);

    const handleOpenAddSerie = () => {
        setSelectedSerie(null);
        setIsSerieModalOpen(true);
    };

    const handleOpenEditSerie = (serie) => {
        setSelectedSerie(serie);
        setIsSerieModalOpen(true);
    };

    const handleOpenAddBook = (serie) => {
        setSelectedSerie(serie);
        setIsAddBookModalOpen(true);
    };

    const handleRemoveBookFromSerie = async (serieId, bookId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/series/${serieId}/books/${bookId}`);
            fetchSeriesAndBooks();
        } catch (err) {
            console.error('Failed to remove book from serie:', err);
        }
    };

    return (
        <div className="series-page">
            <div className="serie-header-row">
                <div>
                    <h1>Series</h1>
                    <p>Manage your series from here</p>
                </div>
                <button className="btn-add-serie" onClick={handleOpenAddSerie}>
                    <Plus size={18} /> Add Serie
                </button>
            </div>

            <div className="series-grid">
                {series.map((item) => (
                    <div key={item._id} className="serie-card">
                        <div className="serie-card-header">
                            <h3>{item.name}</h3>
                            <button
                                className="edit-serie-btn"
                                onClick={() => handleOpenEditSerie(item)}
                                title="Edit Serie"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>

                        <div className="serie-card-body">
                            {item.books && item.books.length > 0 ? (
                                item.books.map((book) => (
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
                                            onClick={() => handleRemoveBookFromSerie(item._id, book._id)}
                                            title="Remove Book"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-books-text">Add book for this serie</p>
                            )}

                            <div className="add-book-footer">
                                <button
                                    className="btn-add-book"
                                    onClick={() => handleOpenAddBook(item)}
                                >
                                    <Plus size={14} /> add a Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <SerieFormModal
                isOpen={isSerieModalOpen}
                onClose={() => setIsSerieModalOpen(false)}
                serie={selectedSerie}
                availableBooks={availableBooks}
                onSave={fetchSeriesAndBooks}
            />

            <AddBookToSerieModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                serie={selectedSerie}
                availableBooks={availableBooks}
                onSave={fetchSeriesAndBooks}
            />
        </div>
    );
};