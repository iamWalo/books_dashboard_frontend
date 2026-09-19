import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function SearchBar({ value, onChange, category, onCategoryChange, status, onStatusChange }) {
    return (
        <div className="toolbar">
            <label className="search-field">
                <Search size={18} />
                <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search products" aria-label="Search products" />
                {value && <button type="button" onClick={() => onChange('')} aria-label="Clear search"><X size={15} /></button>}
            </label>
            <div className="filter-group">
                <span className="filter-label"><SlidersHorizontal size={15} /> Filters</span>
                <select value={category} onChange={(event) => onCategoryChange(event.target.value)} aria-label="Filter by category">
                    <option value="all">All categories</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Learning">Learning</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="Stories">Stories</option>
                </select>
                <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter by status">
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
    )
}
