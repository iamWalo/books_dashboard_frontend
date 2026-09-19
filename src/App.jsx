import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import { Dashboard } from './pages/Dashboard/Dashboard';
import ProductPage from './pages/ProductPage/ProductPage';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage';
import { SeriesPage } from './pages/SeriesPage/SeriesPage';
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
                        <Route path="/series" element={<SeriesPage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default App;