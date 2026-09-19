import { Edit3, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../services/productService'

const fallbackColors = ['#f6d5bd', '#d7e4d2', '#ddd5e9', '#f2e5af', '#cfe3e9']

function ProductThumbnail({ product, index }) {
    return product.image ? <img className="product-thumb" src={getImageUrl(product.image)} alt="" /> : <div className="product-thumb placeholder-thumb" style={{ backgroundColor: fallbackColors[index % fallbackColors.length] }}>{product.name?.slice(0, 1)}</div>
}

export default function ProductTable({ products, onDelete }) {
    return (
        <div className="table-wrap">
            <table className="product-table">
                <thead><tr><th>Product</th><th>Price</th><th>Category</th><th>Stock</th><th>Status</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product._id || product.id}>
                            <td><div className="product-cell"><ProductThumbnail product={product} index={index} /><div><strong>{product.name}</strong><small>{product.serie || 'Independent title'}</small></div></div></td>
                            <td className="price-cell">${Number(product.price || 0).toFixed(2)}</td>
                            <td><span className="category-text">{product.category || 'Uncategorized'}</span></td>
                            <td><span className={Number(product.stockQuantity) < 10 ? 'stock low' : 'stock'}>{product.stockQuantity ?? 0} <small>in stock</small></span></td>
                            <td><span className={product.status === 'inactive' ? 'status inactive' : 'status'}><i />{product.status || 'active'}</span></td>
                            <td><div className="row-actions"><Link className="icon-button" to={`/products/${product._id || product.id}/edit`} aria-label={`Edit ${product.name}`}><Edit3 size={16} /></Link><button className="icon-button danger" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button><button className="icon-button more" aria-label="More actions"><MoreHorizontal size={17} /></button></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mobile-product-list">
                {products.map((product, index) => <div className="mobile-product-card" key={product._id || product.id}><div className="product-cell"><ProductThumbnail product={product} index={index} /><div><strong>{product.name}</strong><small>{product.category || 'Uncategorized'} · ${Number(product.price || 0).toFixed(2)}</small></div></div><div className="mobile-card-bottom"><span className={product.status === 'inactive' ? 'status inactive' : 'status'}><i />{product.status || 'active'}</span><div className="row-actions"><Link className="icon-button" to={`/products/${product._id || product.id}/edit`} aria-label="Edit product"><Edit3 size={16} /></Link><button className="icon-button danger" onClick={() => onDelete(product)} aria-label="Delete product"><Trash2 size={16} /></button></div></div></div>)}
            </div>
        </div>
    )
}
