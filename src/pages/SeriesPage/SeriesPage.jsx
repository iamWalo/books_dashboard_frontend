import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { SerieFormModal, AddBookToSerieModal } from '../../components/SeriesModals/SeriesModals';
import { productService } from '../../services/productService';
import { api, getErrorMessage, getImageUrl } from '../../services/api';
import ConfirmModal from '../../components/Feedback/ConfirmModal';
import useFeedback from '../../components/Feedback/useFeedback';
import './SeriesPage.css';

const getReferenceId = (value) => {
    if (!value) return '';
    if (typeof value === 'object') return value._id || value.id || '';
    return value;
};

export const SeriesPage = () => {
    const [series, setSeries] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [isSerieModalOpen, setIsSerieModalOpen] = useState(false);
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [selectedSerie, setSelectedSerie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookToRemove, setBookToRemove] = useState(null);
    const [removeLoading, setRemoveLoading] = useState(false);
    const { showSuccess, showError, toastElement } = useFeedback();

    const fetchSeriesAndBooks = async () => {
        try {
            setLoading(true);
            setError('');
            const [seriesData, booksData] = await Promise.all([
                productService.getSeries(),
                productService.getBooks(),
            ]);
            setSeries(seriesData);
            setAvailableBooks(booksData);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load series and products.'));
        } finally {
            setLoading(false);
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

    const getSerieBooks = (serie) => {
        const serieId = String(serie._id);
        const selectedBooks = availableBooks.filter(
            (book) => String(getReferenceId(book.serie)) === serieId
        );
        const selectedBookIds = new Set(selectedBooks.map((book) => String(book._id)));
        const legacyBooks = (serie.books || []).filter(
            (book) => !selectedBookIds.has(String(getReferenceId(book)))
        );

        return [...selectedBooks, ...legacyBooks];
    };

    const handleRemoveBookFromSerie = async () => {
        const { serieId, bookId } = bookToRemove;
        setRemoveLoading(true);
        try {
            const result = await api.delete(`/api/series/${serieId}/books/${bookId}`);
            await fetchSeriesAndBooks();
            setBookToRemove(null);
            showSuccess(result.data?.message || 'Book removed from series.');
        } catch (err) {
            showError(getErrorMessage(err, 'Could not remove the book from this series.'));
        } finally {
            setRemoveLoading(false);
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
                {loading ? <p>Loading series...</p> : error ? <p>{error}</p> : series.length === 0 ? <p>No series found.</p> : series.map((item) => (
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
                            {getSerieBooks(item).length > 0 ? (
                                getSerieBooks(item).map((book) => (
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
                                            onClick={() => setBookToRemove({ serieId: item._id, bookId: book._id })}
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
                onSuccess={() => showSuccess('Series saved successfully.')}
                onError={(message) => showError(message)}
            />

            <AddBookToSerieModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                serie={selectedSerie}
                availableBooks={availableBooks}
                onSave={fetchSeriesAndBooks}
                onSuccess={() => showSuccess('Book added to series successfully.')}
                onError={(message) => showError(message)}
            />
            {toastElement}
            <ConfirmModal
                isOpen={Boolean(bookToRemove)}
                title="Remove book from series?"
                message="The book will be removed from this series."
                onCancel={() => setBookToRemove(null)}
                onConfirm={handleRemoveBookFromSerie}
                loading={removeLoading}
            />
        </div>
    );
};