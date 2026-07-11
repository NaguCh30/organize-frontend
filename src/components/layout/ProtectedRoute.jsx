import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// Protects routes from unauthenticated access.
// If token exists in localStorage, isAuthenticated will be true on initial load (survives refresh).
export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}