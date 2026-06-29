import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function RegisterPage() {

    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            await register(formData);

            navigate("/dashboard");

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="auth-container">

            <h1>Organize</h1>

            <h2>Create Account</h2>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <button disabled={loading}>
                    {loading ? "Creating..." : "Register"}
                </button>

            </form>

            <p>

                Already have an account?

                <Link to="/login">
                    Login
                </Link>

            </p>

        </div>
    );
}