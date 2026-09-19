import { ArrowLeft, BookPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductForm } from '../../components/ProductForm/ProductForm'
import { createProduct, getProductById, updateProduct } from '../../services/productService'

export default function ProductPage() {
    const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id)
    const [product, setProduct] = useState(null); const [loading, setLoading] = useState(editing); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('')
    useEffect(() => { if (!id) return; getProductById(id).then((result) => setProduct(result.product || result.data || result)).catch((err) => setError(err.response?.data?.message || 'Could not load this product.')).finally(() => setLoading(false)) }, [id])
    const save = async (formData) => { setSubmitting(true); setError(''); try { if (editing) await updateProduct(id, formData); else await createProduct(formData); navigate('/', { state: { saved: true } }) } catch (err) { setError(err.response?.data?.message || 'Could not save this product. Please try again.') } finally { setSubmitting(false) } }
    return <div className="app-shell"><main className="page-content form-page"><Link className="back-link" to="/"><ArrowLeft size={16} /> Back to products</Link><div className="page-heading form-heading"><div><p className="eyebrow"><BookPlus size={14} /> Catalog / {editing ? 'Edit product' : 'New product'}</p><h1>{editing ? 'Edit product' : 'Add a product'}</h1><p className="heading-copy">{editing ? 'Make changes to this title.' : 'Give a new story a place on your shelves.'}</p></div></div>{loading ? <div className="state-box"><div className="spinner" />Loading product...</div> : <div className="form-panel"><ProductForm product={product} onSubmit={save} onCancel={() => navigate('/')} submitting={submitting} feedback={error} /></div>}</main></div>
}
