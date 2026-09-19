import React, { useState } from 'react';
import axios from 'axios';
import './Productform.css';

export const ProductForm = ({ isOpen, onClose, categories = [], series = [] }) => {
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

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddChapter = (e) => {
        if (e.key === 'Enter' && chapterInput.trim()) {
            e.preventDefault();
            setBookChapters([...bookChapters, chapterInput.trim()]);
            setChapterInput('');
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

            data.append('bookChapters', JSON.stringify(bookChapters));

            descriptionImages.forEach((file) => {
                data.append('descriptionImages', file);
            });

            productImages.forEach((file) => {
                data.append('productImages', file);
            });

            await axios.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            onClose();
        } catch (err) {
            console.error('Failed to create product:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    {/* <h2>Add New Product</h2> */}
                    <h2>Moad bytifol</h2>
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
                            <select name="category" value={formData.category} onChange={handleChange} required>
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
                            <label>Size</label>
                            <select name="size" value={formData.size} onChange={handleChange}>
                                <option value="">Select Size</option>
                                <option value="A4">A4</option>
                                <option value="A5">A5</option>
                                <option value="Standard">Standard</option>
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
                            <label>Age Range</label>
                            <select name="ageRange" value={formData.ageRange} onChange={handleChange}>
                                <option value="">Select Age</option>
                                <option value="0-3">0-3 Years</option>
                                <option value="4-7">4-7 Years</option>
                                <option value="8-12">8-12 Years</option>
                                <option value="13+">13+ Years</option>
                            </select>
                        </div>
                    </div>

                    {/* Book Chapters */}
                    <div className="form-group">
                        <label>Book Chapters</label>
                        <div className="tags-container">
                            {bookChapters.map((chap, index) => (
                                <span key={index} className="tag">
                                    {chap}
                                    <button type="button" onClick={() => handleRemoveChapter(index)}>&times;</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Type chapter & hit Enter"
                                value={chapterInput}
                                onChange={(e) => setChapterInput(e.target.value)}
                                onKeyDown={handleAddChapter}
                            />
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