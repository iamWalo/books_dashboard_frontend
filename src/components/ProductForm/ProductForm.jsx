import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import './Productform.css';

const getReferenceId = (value) => {
    if (!value) return '';
    return typeof value === 'object' ? value._id || value.id || '' : value;
};

const normalizeChapters = (chapters) => {
    if (!Array.isArray(chapters)) return [];

    return chapters.flatMap((chapter) => {
        if (typeof chapter !== 'string') return chapter ? [String(chapter)] : [];

        try {
            const parsed = JSON.parse(chapter);
            return Array.isArray(parsed) ? parsed.map(String) : [chapter];
        } catch {
            return [chapter];
        }
    });
};

export const ProductForm = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    categories: initialCategories = [],
    series: initialSeries = [],
    onError,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        serie: '',
        status: 'In Stock',
        size: '',
        pagesNumber: 0,
        ageRange: '',
    });

    const [activeTab, setActiveTab] = useState('code');
    const [chapterInput, setChapterInput] = useState('');
    const [bookChapters, setBookChapters] = useState([]);
    const [descriptionImages, setDescriptionImages] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState(initialCategories);
    const [series, setSeries] = useState(initialSeries);

    useEffect(() => {
        let mounted = true;

        Promise.all([productService.getCategories(), productService.getSeries()])
            .then(([categoryOptions, seriesOptions]) => {
                if (mounted) {
                    setCategories(categoryOptions);
                    setSeries(seriesOptions);
                }
            })
            .catch((err) => onError?.(getErrorMessage(err, 'Could not load categories and series.')));

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                name: initialData.name || '',
                price: initialData.price ?? '',
                description: initialData.description || '',
                category: getReferenceId(initialData.category),
                serie: getReferenceId(initialData.serie),
                status: initialData.status || 'In Stock',
                size: initialData.size || '',
                pagesNumber: initialData.pagesNumber ?? 0,
                ageRange: initialData.ageRange || '',
            });
            setBookChapters(normalizeChapters(initialData.bookChapters || initialData.chapters));
        } else {
            setFormData({
                name: '',
                price: '',
                description: '',
                category: '',
                serie: '',
                status: 'In Stock',
                size: '',
                pagesNumber: 0,
                ageRange: '',
            });
            setBookChapters([]);
        }

        setChapterInput('');
        setDescriptionImages([]);
        setProductImages([]);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddChapter = () => {
        const title = chapterInput.trim();
        if (!title) return;

        setBookChapters((chapters) => [...chapters, title]);
        setChapterInput('');
    };

    const handleChapterKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddChapter();
        }
    };

    const handleRemoveChapter = (indexToRemove) => {
        setBookChapters(bookChapters.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });

            bookChapters.forEach((chapter) => {
                data.append('bookChapters', chapter);
            });

            descriptionImages.forEach((file) => {
                data.append('descriptionImages', file);
            });

            productImages.forEach((file) => {
                data.append('productImages', file);
            });

            if (onSubmit) {
                await onSubmit(data);
            } else {
                await productService.createProduct(data);
                onClose();
            }
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    {/* Product Name & Price */}
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>Product Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>Price</label>
                            <div className="input-suffix">
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}

                                />
                                <span className="currency">$</span>
                            </div>
                        </div>
                    </div>

                    {/* HTML Description Field with Code/Preview Toggle */}
                    <div className="form-group">
                        <div className="html-header-row">
                            <label>Description (HTML Code Allowed)</label>
                            <div className="tab-buttons">
                                <button
                                    type="button"
                                    className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('code')}
                                >
                                    HTML Code
                                </button>
                                <button
                                    type="button"
                                    className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preview')}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {activeTab === 'code' ? (
                            <textarea
                                name="description"
                                placeholder="<p>Enter <strong>HTML</strong> description here...</p>"
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                className="code-textarea"
                            />
                        ) : (
                            <div
                                className="html-preview-box"
                                dangerouslySetInnerHTML={{
                                    __html: formData.description || '<p style="color:#94a3b8;">Nothing to preview</p>',
                                }}
                            />
                        )}
                    </div>

                    {/* Description Images */}
                    <div className="form-group">
                        <label>Add Images In description</label>
                        <div className="upload-box">
                            <input
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => setDescriptionImages(Array.from(e.target.files))}
                            />
                            <p>Click to upload or drag and drop</p>
                            <small>PNG, JPG up to 10MB</small>
                        </div>
                    </div>

                    {/* Category & Serie */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Serie</label>
                            <select name="serie" value={formData.serie} onChange={handleChange}>
                                <option value="">Select Serie</option>
                                {series.map((s) => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status & Size */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Pre-order">Pre-order</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Size (inches)</label>
                            <select name="size" value={formData.size} onChange={handleChange}>
                                <option value="">Select Size</option>
                                <option value="5 × 8 in">5 × 8 in</option>
                                <option value="5.06 × 7.81 in">5.06 × 7.81 in</option>
                                <option value="5.25 × 8 in">5.25 × 8 in</option>
                                <option value="5.5 × 8.5 in">5.5 × 8.5 in</option>
                                <option value="6 × 9 in">6 × 9 in</option>
                                <option value="6.14 × 9.21 in">6.14 × 9.21 in</option>
                                <option value="7 × 10 in">7 × 10 in</option>
                                <option value="7.5 × 9.25 in">7.5 × 9.25 in</option>
                                <option value="8 × 10 in">8 × 10 in</option>
                                <option value="8.25 × 10.5 in">8.25 × 10.5 in</option>
                                <option value="8.5 × 8.5 in">8.5 × 8.5 in</option>
                                <option value="8.5 × 11 in">8.5 × 11 in</option>
                                <option value="8.27 × 11.69 in">8.27 × 11.69 in</option>
                                <option value="11 × 8.5 in">11 × 8.5 in</option>
                            </select>
                        </div>
                    </div>

                    {/* Pages Number & Age Range */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Pages Number</label>
                            <input
                                type="number"
                                name="pagesNumber"
                                value={formData.pagesNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Age Range (years)</label>
                            <select name="ageRange" value={formData.ageRange} onChange={handleChange}>
                                <option value="">Select Age</option>
                                <option value="3-5">3-5</option>
                                <option value="6-12">6-12</option>
                                <option value="13-17">13-17</option>
                                <option value="18+">+18</option>
                            </select>
                        </div>
                    </div>

                    {/* Book Chapters */}
                    <div className="form-group">
                        <label>Book Chapters</label>
                        <div className="tags-container">
                            <div className="chapter-input-row">
                                <span className="chapter-number">{bookChapters.length + 1}</span>
                                <input
                                    type="text"
                                    placeholder="Type chapter title"
                                    value={chapterInput}
                                    onChange={(e) => setChapterInput(e.target.value)}
                                    onKeyDown={handleChapterKeyDown}
                                />
                                <button type="button" className="chapter-add-button" onClick={handleAddChapter} aria-label="Add chapter">+</button>
                            </div>
                            {bookChapters.map((chap, index) => (
                                <span key={`${chap}-${index}`} className="tag">
                                    <span className="chapter-number">{index + 1}</span>
                                    <span>{chap}</span>
                                    <button type="button" onClick={() => handleRemoveChapter(index)} aria-label={`Delete chapter ${index + 1}`}>&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Product Gallery Images */}
                    <div className="form-group">
                        <label>Product Images</label>
                        <div className="upload-box">
                            <input
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => setProductImages(Array.from(e.target.files))}
                            />
                            <p>Click to upload or drag and drop</p>
                            <small>PNG, JPG up to 10MB</small>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};