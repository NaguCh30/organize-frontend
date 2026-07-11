import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { 
    LayoutDashboard, 
    Target, 
    Calendar, 
    Sparkles, 
    Info, 
    LogOut, 
    Menu, 
    X,
    CheckSquare
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
        setIsOpen(false);
    }

    return (
        <>
            {/* Topbar for mobile view */}
            <header className="mobile-header">
                <div className="logo" onClick={() => navigate("/dashboard")}>
                    <CheckSquare className="logo-icon" />
                    <span>Organize</span>
                </div>
                <button 
                    className="menu-btn" 
                    onClick={() => setIsOpen(!isOpen)} 
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Navigation */}
            <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-brand" onClick={() => { navigate("/dashboard"); setIsOpen(false); }}>
                    <CheckSquare className="brand-logo" />
                    <span>Organize</span>
                </div>

                <nav className="nav-menu">
                    <NavLink 
                        to="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        <LayoutDashboard size={20} className="nav-icon" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink 
                        to="/ai" 
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `nav-link ai-link ${isActive ? "active" : ""}`}
                    >
                        <Sparkles size={20} className="nav-icon" />
                        <span>Organize AI</span>
                    </NavLink>

                    <NavLink 
                        to="/about" 
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        <Info size={20} className="nav-icon" />
                        <span>About Organize</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} className="logout-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile backdrop */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
}