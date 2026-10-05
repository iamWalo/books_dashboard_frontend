import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import { Dashboard } from './pages/Dashboard/Dashboard';
import ProductPage from './pages/ProductPage/ProductPage';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage';
import { SeriesPage } from './pages/SeriesPage/SeriesPage';
import BlogDashboard from './pages/BlogDashboard/BlogDashboard';
import AddBlogPage from './pages/AddBlogPage/AddBlogPage';
import './App.css';

function App() {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div className="page-body">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Dashboard />} />
                        <Route path="/products/new" element={<ProductPage />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        {/* Blog Routes */}
                        <Route path="/blogs" element={<BlogDashboard />} />
                        <Route path="/blogs/new" element={<AddBlogPage />} />
                        <Route path="/blogs/:id/edit" element={<AddBlogPage />} />
                        <Route path="/blogs/edit/:id" element={<AddBlogPage />} />
                        <Route path="/series" element={<SeriesPage />} />
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default App;