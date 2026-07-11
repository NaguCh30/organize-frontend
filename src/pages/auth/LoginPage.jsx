import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Mail, Lock, CheckSquare, AlertCircle } from "lucide-react";
import "./auth.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect to dashboard if already logged in (e.g., on refresh)
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-logo">
                    <CheckSquare size={32} className="logo-icon" />
                    <span>Organize</span>
                </div>
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to continue your journey</p>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-wrapper">
                        <input type="email" name="email" placeholder="Email Address"
                            value={formData.email} onChange={handleChange} required />
                        <Mail className="auth-input-icon" size={18} />
                    </div>

                    <div className="auth-input-wrapper">
                        <input type="password" name="password" placeholder="Password"
                            value={formData.password} onChange={handleChange} required />
                        <Lock className="auth-input-icon" size={18} />
                    </div>

                    <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}