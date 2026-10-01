import React, { useEffect, useState } from 'react';
import { getImageUrl, productService } from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import './Productform.css';

const getExistingImageSource = (image) => {
    const path = typeof image === 'string' ? image : image?.url || image?.path;
    return getImageUrl(path);
};

const ImagePreviewList = ({ images, onRemove, resolveSource = (image) => image }) => {
    if (!images.length) return null;

    return (
        <div className="image-preview-list">
            {images.map((image, index) => (
                <div className="image-preview" key={`${index}-${String(image)}`}>
                    <img
                        src={resolveSource(image)}
                        alt={`Image preview ${index + 1}`}
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                    {onRemove && (
                        <button
                            type="button"
                            className="image-preview-remove"
                            onClick={() => onRemove(index)}
                            aria-label={`Remove image ${index + 1}`}
                        >
                            &times;
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

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
        subtitle: '',
        price: '',
        description: '',
        category: '',
        categories: [],
        serie: '',
        status: 'Active',
        size: '',
        pagesNumber: 0,
        ageRange: '',
    });

    const [activeTab, setActiveTab] = useState('code');
    const [chapterInput, setChapterInput] = useState('');
    const [bookChapters, setBookChapters] = useState([]);

    // Track newly selected File objects
    const [descriptionImages, setDescriptionImages] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [descriptionImagePreviews, setDescriptionImagePreviews] = useState([]);
    const [productImagePreviews, setProductImagePreviews] = useState([]);

    // Track existing image URLs from database
    const [existingProductImages, setExistingProductImages] = useState([]);
    const [existingDescriptionImages, setExistingDescriptionImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState(initialCategories);
    const [series, setSeries] = useState(initialSeries);

    useEffect(() => {
        const previewUrls = descriptionImages.map((file) => URL.createObjectURL(file));
        setDescriptionImagePreviews(previewUrls);
        return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
    }, [descriptionImages]);

    useEffect(() => {
        const previewUrls = productImages.map((file) => URL.createObjectURL(file));
        setProductImagePreviews(previewUrls);
        return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
    }, [productImages]);

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
                subtitle: initialData.subtitle || '',
                price: initialData.price ?? '',
                description: initialData.description || '',
                category: getReferenceId(initialData.category),
                categories: Array.isArray(initialData.categories) ? initialData.categories : [],
                serie: getReferenceId(initialData.serie),
                status: initialData.status || 'Active',
                size: initialData.size || '',
                pagesNumber: initialData.pagesNumber ?? 0,
                ageRange: initialData.ageRange || '',
            });
            setBookChapters(normalizeChapters(initialData.bookChapters || initialData.chapters));

            // Populate existing image URLs/paths from backend
            setExistingProductImages(
                Array.isArray(initialData.productImages) ? initialData.productImages : []
            );
            setExistingDescriptionImages(
                Array.isArray(initialData.descriptionImages) ? initialData.descriptionImages : []
            );
        } else {
            setFormData({
                name: '',
                subtitle: '',
                price: '',
                description: '',
                category: '',
                categories: [],
                serie: '',
                status: 'Active',
                size: '',
                pagesNumber: 0,
                ageRange: '',
            });
            setBookChapters([]);
            setExistingProductImages([]);
            setExistingDescriptionImages([]);
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

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            const currentCategories = prev.categories || [];
            if (checked) {
                return { ...prev, categories: [...currentCategories, value] };
            } else {
                return {
                    ...prev,
                    categories: currentCategories.filter((item) => item !== value),
                };
            }
        });
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

    const handleDescriptionImagesChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setDescriptionImages(Array.from(e.target.files));
        }
    };

    const handleProductImagesChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setProductImages(Array.from(e.target.files));
        }
    };

    const handleRemoveExistingProductImage = (indexToRemove) => {
        setExistingProductImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleRemoveExistingDescriptionImage = (indexToRemove) => {
        setExistingDescriptionImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key === 'categories') {
                    formData.categories.forEach((cat) => {
                        data.append('categories', cat);
                    });
                } else {
                    data.append(key, formData[key]);
                }
            });

            bookChapters.forEach((chapter) => {
                data.append('bookChapters', chapter);
            });

            // Append existing preserved image paths as strings
            existingDescriptionImages.forEach((img) => {
                data.append('existingDescriptionImages', typeof img === 'string' ? img : img.url || img.path);
            });

            existingProductImages.forEach((img) => {
                data.append('existingProductImages', typeof img === 'string' ? img : img.url || img.path);
            });

            // Append new File objects for Multer processing
            descriptionImages.forEach((file) => {
                data.append('descriptionImages', file);
            });

            productImages.forEach((file) => {
                data.append('productImages', file);
            });

            if (onSubmit) {
                await onSubmit(data);
            } else if (initialData && initialData._id) {
                await productService.updateProduct(initialData._id, data);
                onClose();
            } else {
                await productService.createProduct(data);
                onClose();
            }
        } catch (err) {
            onError?.(getErrorMessage(err, 'Failed to save product.'));
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
                                    required
                                />
                                <span className="currency">$</span>
                            </div>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Product Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                placeholder="Enter product subtitle"
                                value={formData.subtitle || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Category Checkboxes */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <div className="checkbox-group">
                                <label>
                                    <span className="checkbox-icon">📖</span>
                                    choose story book
                                    <input
                                        type="checkbox"
                                        value="story_book"
                                        checked={(formData.categories || []).includes('story_book')}
                                        onChange={handleCheckboxChange}
                                    />
                                </label>
                                <label>
                                    <span className="checkbox-icon">⭐</span>
                                    choose best selling book
                                    <input
                                        type="checkbox"
                                        value="best_selling"
                                        checked={(formData.categories || []).includes('best_selling')}
                                        onChange={handleCheckboxChange}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* HTML Description Field */}
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
                        <ImagePreviewList
                            images={existingDescriptionImages}
                            onRemove={handleRemoveExistingDescriptionImage}
                            resolveSource={getExistingImageSource}
                        />
                        <ImagePreviewList images={descriptionImagePreviews} />
                        <div className="upload-box">
                            <input
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleDescriptionImagesChange}
                            />
                            <p>Click to upload or drag and drop</p>
                            <small>PNG, JPG up to 10MB</small>
                        </div>
                        {descriptionImages.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#16a34a' }}>
                                New uploads: {descriptionImages.map((f) => f.name).join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Category & Serie */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
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
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
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
                        <ImagePreviewList
                            images={existingProductImages}
                            onRemove={handleRemoveExistingProductImage}
                            resolveSource={getExistingImageSource}
                        />
                        <ImagePreviewList images={productImagePreviews} />
                        <div className="upload-box">
                            <input
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleProductImagesChange}
                            />
                            <p>Click to upload or drag and drop</p>
                            <small>PNG, JPG up to 10MB</small>
                        </div>
                        {productImages.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#16a34a' }}>
                                New uploads: {productImages.map((f) => f.name).join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};