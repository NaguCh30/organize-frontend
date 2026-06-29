import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";

export default function Navbar() {

    const { logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="navbar">

            <div className="logo">

                <span>Organize</span>

            </div>

            <button
                className="menu-btn"
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            <nav className={open ? "nav-links active" : "nav-links"}>

                <NavLink to="/dashboard">Dashboard</NavLink>

                <NavLink to="/goals">Goals</NavLink>

                <NavLink to="/schedule">Schedule</NavLink>

                <NavLink
                    to="/ai"
                    className={({ isActive }) =>
                        isActive ? "ai-link active" : "ai-link"
                    }
                >
                    AI
                </NavLink>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </nav>

        </header>
    );
}