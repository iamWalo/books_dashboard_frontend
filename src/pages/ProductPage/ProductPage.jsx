import { ArrowLeft, BookPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductForm } from '../../components/ProductForm/ProductForm';
import useFeedback from '../../components/Feedback/useFeedback';
import { getErrorMessage } from '../../services/api';
import { createProduct, getProductById, updateProduct } from '../../services/productService';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(editing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showSuccess, showError, toastElement } = useFeedback();

    useEffect(() => {
        if (!id) return;
        getProductById(id)
            .then((result) => setProduct(result.product || result.data || result))
            .catch((requestError) => {
                const message = getErrorMessage(requestError, 'Could not load this product.');
                setError(message);
                showError(message);
            })
            .finally(() => setLoading(false));
    }, [id, showError]);

    const save = async (formData) => {
        setSubmitting(true);
        setError('');
        try {
            const result = editing ? await updateProduct(id, formData) : await createProduct(formData);
            showSuccess(result?.message || (editing ? 'Product updated successfully.' : 'Product created successfully.'));
            window.setTimeout(() => navigate('/'), 500);
        } catch (requestError) {
            const message = getErrorMessage(requestError, 'Could not save this product.');
            setError(message);
            showError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="app-shell">
            <main className="page-content form-page">
                <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to products</Link>
                <div className="page-heading form-heading">
                    <div>
                        <p className="eyebrow"><BookPlus size={14} /> Catalog / {editing ? 'Edit product' : 'New product'}</p>
                        <h1>{editing ? 'Edit product' : 'Add a product'}</h1>
                        <p className="heading-copy">{editing ? 'Make changes to this title.' : 'Give a new story a place on your shelves.'}</p>
                    </div>
                </div>
                {error && <div className="state-box error-state">{error}</div>}
                {loading ? (
                    <div className="state-box"><div className="spinner" />Loading product...</div>
                ) : (
                    <div className="form-panel">
                        <ProductForm
                            isOpen
                            initialData={product}
                            onSubmit={save}
                            onClose={() => navigate('/')}
                            isLoading={submitting}
                            onError={showError}
                        />
                    </div>
                )}
                {toastElement}
            </main>
        </div>
    );
}
