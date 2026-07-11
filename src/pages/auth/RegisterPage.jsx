import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Mail, Lock, User, CheckSquare, AlertCircle } from "lucide-react";
import "./auth.css";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        try {
            await register(formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Failed to create an account.");
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
                <h2>Create Account</h2>
                <p className="auth-subtitle">Start organizing your goals today</p>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-wrapper">
                        <input type="text" name="username" placeholder="Username"
                            value={formData.username} onChange={handleChange} required />
                        <User className="auth-input-icon" size={18} />
                    </div>
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
                    <div className="auth-input-wrapper">
                        <input type="password" name="confirmPassword" placeholder="Confirm Password"
                            value={formData.confirmPassword} onChange={handleChange} required />
                        <Lock className="auth-input-icon" size={18} />
                    </div>
                    <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?
                    <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}