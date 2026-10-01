import React, { useEffect, useState, useRef } from 'react';
import {
    ArrowLeft, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Link, Image as ImageIcon, X, Plus, Eye, List
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getErrorMessage } from '../../services/api';
import { blogService } from '../../services/blogService';
import useFeedback from '../../components/Feedback/useFeedback';
import './AddBlogPage.css';

export const AddBlogPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const editing = Boolean(id);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [body, setBody] = useState('');
    const [author, setAuthor] = useState('WhyQuest Team');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [publishDate, setPublishDate] = useState('');
    const [status, setStatus] = useState('Draft');
    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop');

    // UI state
    const [categories, setCategories] = useState([]);
    const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'html'
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const { showSuccess, showError, toastElement } = useFeedback();

    useEffect(() => {
        blogService.getCategories().then(setCategories).catch((requestError) => {
            setCategories([]);
            showError(getErrorMessage(requestError, 'Could not load blog categories.'));
        });

        if (!editing) return;

        blogService.getBlogById(id)
            .then((blog) => {
                setTitle(blog.title || '');
                setDescription(blog.description || '');
                setBody(blog.body || '');
                setAuthor(blog.author || '');
                setCategory(blog.category || '');
                setTags(blog.tags || []);
                setPublishDate(blog.publishDate ? blog.publishDate.slice(0, 16) : '');
                setStatus(blog.status || 'Draft');
                if (blog.bannerUrl) setBannerPreview(blog.bannerUrl);
            })
            .catch((requestError) => {
                const message = getErrorMessage(requestError, 'Could not load this blog.');
                setError(message);
                showError(message);
            })
            .finally(() => setLoading(false));
    }, [editing, id]);

    // Format handlers for Article Body Textarea
    const applyFormatting = (tag, styleProperty = null, styleValue = null) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = body.substring(start, end) || 'formatted text';

        let replacement = '';

        if (tag === 'b') {
            replacement = `<b>${selectedText}</b>`;
        } else if (tag === 'i') {
            replacement = `<i>${selectedText}</i>`;
        } else if (tag === 'u') {
            replacement = `<u>${selectedText}</u>`;
        } else if (tag === 'p' && styleProperty) {
            replacement = `<p style="${styleProperty}: ${styleValue};">${selectedText}</p>`;
        } else if (tag === 'ul') {
            replacement = `\n<ul>\n  <li>${selectedText}</li>\n</ul>\n`;
        } else {
            replacement = `${tag}${selectedText}`;
        }

        const newBody = body.substring(0, start) + replacement + body.substring(end);
        setBody(newBody);

        setTimeout(() => {
            textarea.focus();
        }, 0);
    };

    // Tag Handlers
    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^#/, '');
            if (trimmed && !tags.includes(trimmed)) {
                setTags([...tags, trimmed]);
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    // Image Upload Handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const saveBlog = async (nextStatus) => {
        if (!title.trim() || !body.trim()) {
            const message = 'Title and article body are required.';
            setError(message);
            showError(message, 'Validation failed');
            return;
        }
        setSaving(true);
        setError('');

        const blogData = {
            title: title.trim(),
            description,
            body,
            author,
            ...(category.trim() ? { category: category.trim() } : {}),
            tags,
            publishDate: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
            status: nextStatus,
            bannerUrl: bannerPreview,
        };

        try {
            const result = editing
                ? await blogService.updateBlog(id, blogData)
                : await blogService.createBlog(blogData);
            showSuccess(result?.message || (editing ? 'Blog post updated successfully.' : 'Blog post created successfully.'));
            window.setTimeout(() => navigate('/blogs'), 500);
        } catch (requestError) {
            const message = getErrorMessage(requestError, 'Could not save this blog.');
            setError(message);
            showError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="add-blog-container">
            {/* Navigation Breadcrumb */}
            <div className="top-breadcrumb">
                <button onClick={() => navigate('/blogs')} className="breadcrumb-back">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span>Blogs / {editing ? 'Edit Post' : 'Add New Post'}</span>
            </div>

            {/* Header Actions */}
            <div className="add-blog-header">
                <div>
                    <h1 className="add-blog-title">{editing ? 'Edit Post' : 'Add New Post'}</h1>
                    <p className="add-blog-subtitle">Manage your blogs from here</p>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="btn-secondary-outline"
                        onClick={() => setShowPreviewModal(true)}
                    >
                        <Eye className="w-4 h-4 inline-icon" /> Preview
                    </button>
                    <button
                        type="button"
                        className="btn-secondary-outline"
                        onClick={() => saveBlog('Draft')}
                        disabled={saving}
                    >
                        Save Draft
                    </button>
                    <button
                        type="button"
                        className="btn-purple-primary"
                        onClick={() => saveBlog('Published')}
                        disabled={saving}
                    >
                        ↑ {editing ? 'Update Post' : 'Publish Post'}
                    </button>
                </div>
            </div>

            {error && <div className="state-box error-state">{error}</div>}
            {loading && <div className="state-box">Loading blog...</div>}
            {toastElement}

            {/* Form Content Grid */}
            {!loading && (
                <div className="form-layout-grid">
                    {/* Left Column: Article Editor */}
                    <div className="editor-card">
                        <h2 className="card-heading">Article Editor</h2>

                        <div className="form-group-item">
                            <label className="field-label">Article Title *</label>
                            <input
                                type="text"
                                className="input-styled"
                                placeholder="Enter article title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <p className="field-help-text">
                                Keep titles engaging and under 70 characters for premium search formatting.
                            </p>
                        </div>

                        <div className="form-group-item">
                            <label className="field-label">Featured Banner Image</label>
                            <div className="banner-upload-box">
                                <img
                                    src={bannerPreview}
                                    alt="Banner Preview"
                                    className="banner-img-preview"
                                />
                                <div>
                                    <p className="field-help-text" style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                                        This will serve as the prominent card thumbnail and header cover.<br />
                                        Recommended size: 1200x630px. Max: 5MB.
                                    </p>
                                    <div className="banner-btn-group">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn-secondary-outline btn-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Change Image
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-text-danger"
                                            onClick={() => setBannerPreview('')}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group-item">
                            <label className="field-label">Description</label>
                            <textarea
                                className="input-styled"
                                rows={3}
                                placeholder="Brief synopsis or preview excerpt for blog listings..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group-item">
                            <div className="wysiwyg-header">
                                <label className="field-label" style={{ marginBottom: 0 }}>Article Body *</label>
                                <div className="editor-mode-toggle">
                                    <button
                                        type="button"
                                        className={editorMode === 'visual' ? 'toggle-btn active' : 'toggle-btn'}
                                        onClick={() => setEditorMode('visual')}
                                    >
                                        Visual
                                    </button>
                                    <button
                                        type="button"
                                        className={editorMode === 'html' ? 'toggle-btn active' : 'toggle-btn'}
                                        onClick={() => setEditorMode('html')}
                                    >
                                        HTML Code
                                    </button>
                                </div>
                            </div>

                            <div className="wysiwyg-container">
                                {editorMode === 'visual' && (
                                    <div className="wysiwyg-toolbar">
                                        <div className="wysiwyg-actions">{/* Bold Button */}
                                            <button type="button" title="Bold" className="toolbar-btn" onClick={() => applyFormatting('b')}>
                                                <Bold className="w-4 h-4" />
                                            </button>

                                            {/* Italic Button */}
                                            <button type="button" title="Italic" className="toolbar-btn" onClick={() => applyFormatting('i')}>
                                                <Italic className="w-4 h-4" />
                                            </button>

                                            {/* Underline Button */}
                                            <button type="button" title="Underline" className="toolbar-btn" onClick={() => applyFormatting('u')}>
                                                <Underline className="w-4 h-4" />
                                            </button>

                                            {/* Alignments */}
                                            <button type="button" title="Align Left" className="toolbar-btn" onClick={() => applyFormatting('p', 'text-align', 'left')}>
                                                <AlignLeft className="w-4 h-4" />
                                            </button>
                                            <button type="button" title="Align Center" className="toolbar-btn" onClick={() => applyFormatting('p', 'text-align', 'center')}>
                                                <AlignCenter className="w-4 h-4" />
                                            </button>
                                            <button type="button" title="Align Right" className="toolbar-btn" onClick={() => applyFormatting('p', 'text-align', 'right')}>
                                                <AlignRight className="w-4 h-4" />
                                            </button>  </div>
                                    </div>
                                )}

                                <textarea
                                    ref={textareaRef}
                                    className={`editor-textarea ${editorMode === 'html' ? 'code-mode' : ''}`}
                                    rows={12}
                                    placeholder={editorMode === 'html' ? '<p>Write html structure here...</p>' : 'Start writing your blog content here...'}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Post Settings */}
                    <div className="sidebar-card">
                        <h2 className="card-heading">Post Settings</h2>

                        <div className="form-group-item">
                            <label className="field-label">Author</label>
                            <input
                                type="text"
                                className="input-styled"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                        </div>

                        <div className="form-group-item">
                            <label className="field-label">Category (optional)</label>
                            <select
                                className="select-styled"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select category</option>
                                {categories.map((blogCategory) => (
                                    <option
                                        key={blogCategory._id || blogCategory.name || blogCategory}
                                        value={blogCategory.name || blogCategory}
                                    >
                                        {blogCategory.name || blogCategory}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-item">
                            <label className="field-label">Tags</label>
                            <input
                                type="text"
                                className="input-styled"
                                placeholder="Type tag and press Enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                            <div className="chips-container">
                                {tags.map((tag) => (
                                    <span key={tag} className="category-chip">
                                        #{tag}
                                        <button type="button" className="chip-remove-btn" onClick={() => handleRemoveTag(tag)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group-item">
                            <label className="field-label">Publish Date & Time</label>
                            <input
                                className="input-styled"
                                type="datetime-local"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Live Article Preview Modal */}
            {showPreviewModal && (
                <div className="preview-modal-backdrop" onClick={() => setShowPreviewModal(false)}>
                    <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-modal-header">
                            <h2>Article Preview</h2>
                            <button type="button" onClick={() => setShowPreviewModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="preview-modal-body">
                            {bannerPreview && <img src={bannerPreview} alt="Banner" className="preview-banner" />}
                            <div className="preview-meta">
                                <span>{category || 'Uncategorized'}</span> • <span>{author}</span>
                            </div>
                            <h1>{title || 'Untitled Post'}</h1>
                            <p className="preview-desc">{description}</p>
                            <hr />
                            <div className="preview-body" dangerouslySetInnerHTML={{ __html: body }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddBlogPage;