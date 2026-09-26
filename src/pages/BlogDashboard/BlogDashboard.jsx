import React, { useEffect, useState, useRef } from 'react';
import { Search, Filter, Plus, MoreVertical, User, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../services/api';
import { blogService } from '../../services/blogService';
import BlogCategoryModal from '../../components/BlogCategoryModal/BlogCategoryModal';
import ConfirmModal from '../../components/Feedback/ConfirmModal';
import useFeedback from '../../components/Feedback/useFeedback';
import './BlogDashboard.css';

const BlogDashboard = () => {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { showSuccess, showError, toastElement } = useFeedback();

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Fetch blogs with a debounce on search input
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        const timer = setTimeout(() => {
            blogService.getAllBlogs(searchTerm)
                .then((result) => {
                    if (active) {
                        setBlogs(Array.isArray(result.data) ? result.data : []);
                    }
                })
                .catch((requestError) => {
                    if (active) {
                        setError(getErrorMessage(requestError, 'Could not load blogs.'));
                    }
                })
                .finally(() => {
                    if (active) setLoading(false);
                });
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [searchTerm]);

    // Close action dropdown menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle blog deletion
    const handleDelete = async (id) => {
        setDeleteLoading(true);
        try {
            const result = await blogService.deleteBlog(id);
            setBlogs((currentBlogs) => currentBlogs.filter((blog) => blog._id !== id && blog.id !== id));
            setBlogToDelete(null);
            showSuccess(result?.message || 'Blog post deleted successfully.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Could not delete this blog.'));
            showError(getErrorMessage(requestError, 'Could not delete this blog.'));
        } finally {
            setDeleteLoading(false);
        }
    };

    // Handle creating a category from the modal
    const handleSaveCategory = async (categoryData) => {
        try {
            const res = await blogService.createCategory(categoryData);
            if (res.success || res.data) {
                showSuccess(res.message || 'Blog category created successfully.');
                setIsCategoryModalOpen(false);
            }
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Failed to create blog category.'));
            showError(getErrorMessage(requestError, 'Failed to create blog category.'));
            throw requestError;
        }
    };

    return (
        <div className="blogs-container">
            {/* User Profile Bar */}
            <div className="user-header">
                <div className="user-profile-wrapper">
                    <div className="avatar-circle">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="user-name">Admin User</div>
                        <div className="user-email">admin@store.com</div>
                    </div>
                </div>
            </div>

            {/* Main Header & Action Controls */}
            <div className="blogs-header">
                <div>
                    <h1 className="blogs-title">Blogs</h1>
                    <p className="blogs-subtitle">Manage your blogs from here</p>
                </div>

                <div className="header-actions">
                    <div className="search-wrapper-blog">
                        <input
                            type="text"
                            placeholder="Search a blog ......."
                            className="search-input-blog"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="search-icon-right" />
                    </div>

                    <button className="btn-filter-blog">
                        <Filter className="w-4 h-4" /> Filters
                    </button>

                    <button
                        className="btn-purple-primary"
                        onClick={() => setIsCategoryModalOpen(true)}
                    >
                        + Add Category
                    </button>

                    <button
                        onClick={() => navigate('/blogs/new')}
                        className="btn-purple-primary"
                    >
                        <Plus className="w-4 h-4" /> Add New Post
                    </button>
                </div>
            </div>

            {/* Notification Messages */}
            {error && <div className="state-box error-state">{error}</div>}

            {/* Blog Grid Area */}
            {loading ? (
                <div className="state-box">Loading blogs...</div>
            ) : blogs.length === 0 ? (
                <div className="state-box">No blogs found.</div>
            ) : (
                <div className="blogs-grid">
                    {blogs.map((blog) => {
                        const blogId = blog._id || blog.id;
                        return (
                            <div key={blogId} className="blog-card">
                                <div>
                                    <div className="blog-card-header">
                                        <h3 className="blog-card-title">{blog.title}</h3>
                                        <div className="menu-container" ref={activeMenuId === blogId ? dropdownRef : null}>
                                            <button
                                                className={`btn-more ${activeMenuId === blogId ? 'active' : ''}`}
                                                onClick={() => setActiveMenuId(activeMenuId === blogId ? null : blogId)}
                                                title="Options"
                                                aria-label="Blog options"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {activeMenuId === blogId && (
                                                <div className="action-dropdown">
                                                    <button
                                                        onClick={() => {
                                                            setActiveMenuId(null);
                                                            navigate(`/blogs/edit/${blogId}`);
                                                        }}
                                                        className="dropdown-item edit-item"
                                                    >
                                                        <Edit2 className="w-4 h-4 icon" />
                                                        <span>Edit Post</span>
                                                    </button>
                                                    <div className="dropdown-divider" />
                                                    <button
                                                        onClick={() => {
                                                            setActiveMenuId(null);
                                                            setBlogToDelete(blogId);
                                                        }}
                                                        className="dropdown-item delete-item"
                                                    >
                                                        <Trash2 className="w-4 h-4 icon" />
                                                        <span>Delete Post</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="blog-card-info">
                                        <div>Date and Time: <strong>{blog.publishDate ? new Date(blog.publishDate).toLocaleString() : 'Not scheduled'}</strong></div>
                                        <div>Author: <strong>{blog.author || 'WhyQuest Team'}</strong></div>
                                        <div>Category: <strong>{blog.category || 'General'}</strong></div>
                                    </div>
                                </div>

                                <div className="blog-card-tags">
                                    {(blog.tags || []).map((tag, tagIdx) => (
                                        <span key={tagIdx} className="blog-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Blog Category Creation Modal */}
            <BlogCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={handleSaveCategory}
            />
            {toastElement}
            <ConfirmModal
                isOpen={Boolean(blogToDelete)}
                title="Delete blog post?"
                message="This blog post will be permanently removed."
                onCancel={() => setBlogToDelete(null)}
                onConfirm={() => handleDelete(blogToDelete)}
                loading={deleteLoading}
            />
        </div>
    );
};

export default BlogDashboard;