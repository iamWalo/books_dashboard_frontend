import { Bell, BookOpen, ChevronDown, LayoutGrid, Plus, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import './Header.css'

export default function Header() {
    return (
        <header className="topbar">
            <Link className="brand" to="/">
                <span className="brand-mark"><BookOpen size={18} strokeWidth={2.4} /></span>
                <span>little leaf</span>
            </Link>
            <nav className="main-nav" aria-label="Main navigation">
                <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/">
                    <LayoutGrid size={16} /> Products
                </NavLink>
                <span className="nav-link muted"><Settings size={16} /> Settings</span>
            </nav>
            <div className="header-actions">
                <button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><span /></button>
                <div className="user-menu">
                    <div className="avatar">AS</div>
                    <div className="user-copy"><strong>Anna Smith</strong><small>Administrator</small></div>
                    <ChevronDown size={15} className="chevron" />
                </div>
            </div>
        </header>
    )
}

export function AddProductButton() {
    return <Link className="button button-primary" to="/products/new"><Plus size={17} /> Add product</Link>
}
