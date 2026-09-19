import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange, totalItems }) {
    if (totalPages <= 1) return <div className="result-count">{totalItems} {totalItems === 1 ? 'product' : 'products'}</div>
    return (
        <div className="pagination">
            <span className="result-count">Showing page {page} of {totalPages}</span>
            <div className="page-controls">
                <button className="page-button" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button key={pageNumber} className={pageNumber === page ? 'page-button current' : 'page-button'} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>
                ))}
                <button className="page-button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button>
            </div>
        </div>
    )
}
