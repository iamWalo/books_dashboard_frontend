import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, FolderTree, Layers, FileText, BarChart2, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Admin Panel</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/products"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Package size={18} />
                    <span>Products</span>
                </NavLink>

                <NavLink
                    to="/categories"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <FolderTree size={18} />
                    <span>Categories</span>
                </NavLink>

                <NavLink
                    to="/series"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Layers size={18} />
                    <span>Series</span>
                </NavLink>

                <NavLink
                    to="/blogs"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <FileText size={18} />
                    <span>Blogs</span>
                </NavLink>

                <NavLink
                    to="/analytics"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <BarChart2 size={18} />
                    <span>Analytics</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;