import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getErrorMessage } from '../../services/api';
import { blogService } from '../../services/blogService';
import './BlogCategoryModal.css';

export const BlogCategoryModal = ({ isOpen, onClose, onSave }) => {
    const [categoryName, setCategoryName] = useState('');
    const [posts, setPosts] = useState([]);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setCategoryName('');
            setSelectedPosts([]);
            setError('');
            return;
        }

        let active = true;
        setLoading(true);
        setError('');

        blogService.getAllBlogs()
            .then((result) => {
                if (active) {
                    setPosts(result.data || []);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setError(getErrorMessage(requestError, 'Could not load blog posts.'));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleRemovePost = (postId) => {
        setSelectedPosts((prev) => prev.filter((post) => (post._id || post.id) !== postId));
    };

    const handleSelectPost = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const post = posts.find((item) => (item._id || item.id) === selectedId);
        if (post && !selectedPosts.some((item) => (item._id || item.id) === selectedId)) {
            setSelectedPosts((prev) => [...prev, post]);
        }

        // Reset dropdown value back to default placeholder
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            setError('Category name is required.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await onSave?.({
                name: categoryName.trim(),
                posts: selectedPosts.map((post) => post._id || post.id),
            });
            onClose();
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Could not create the category.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="blog-modal-overlay" onClick={onClose}>
            <div className="blog-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="blog-modal-header">
                    <div>
                        <h2 className="blog-modal-title">Create New Category</h2>
                        <p className="blog-modal-subtitle">Set up a new category for organizing blog posts.</p>
                    </div>
                    <button
                        className="blog-btn-close"
                        onClick={onClose}
                        type="button"
                        disabled={saving}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="blog-modal-body">
                        <div className="blog-modal-field">
                            <label className="blog-modal-label">Category Name</label>
                            <input
                                type="text"
                                className="blog-modal-input"
                                placeholder="Enter category name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                disabled={saving}
                            />
                            <p className="blog-modal-help">This will appear in the category list and navigation.</p>
                        </div>

                        <div className="blog-modal-field">
                            <label className="blog-modal-label">Add Post</label>
                            <div className="blog-select-wrapper">
                                <select
                                    className="blog-modal-select"
                                    defaultValue=""
                                    onChange={handleSelectPost}
                                    disabled={loading || saving}
                                >
                                    <option value="" disabled>
                                        {loading ? 'Loading posts...' : 'Select post'}
                                    </option>
                                    {posts
                                        .filter((post) => !selectedPosts.some((selected) => (selected._id || selected.id) === (post._id || post.id)))
                                        .map((post) => {
                                            const postId = post._id || post.id;
                                            return (
                                                <option key={postId} value={postId}>
                                                    {post.title}
                                                </option>
                                            );
                                        })}
                                </select>
                                <div className="blog-select-icon">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Selected Post Tag Chips */}
                            <div className="blog-chips-wrapper">
                                {selectedPosts.map((post) => {
                                    const postId = post._id || post.id;
                                    return (
                                        <span key={postId} className="blog-tag-chip">
                                            {post.title}
                                            <button
                                                type="button"
                                                className="blog-chip-remove"
                                                onClick={() => handleRemovePost(postId)}
                                                disabled={saving}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {error && <p className="blog-modal-help" style={{ color: '#b42318' }}>{error}</p>}
                    </div>

                    {/* Footer */}
                    <div className="blog-modal-footer">
                        <button
                            type="button"
                            className="blog-btn-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="blog-btn-submit"
                            disabled={loading || saving}
                        >
                            {saving ? 'Adding...' : 'Add Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogCategoryModal;