import { createContext, useState } from "react";
import authService from "../services/authService";
import {
    saveToken,
    saveUser,
    getToken,
    getUser,
    clearStorage
} from "../utils/storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(getUser());
    const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

    const login = async (credentials) => {

        const response = await authService.login(credentials);

        saveToken(response.token);
        saveUser(response.user);

        setUser(response.user);
        setIsAuthenticated(true);
    };

    const register = async (userData) => {

        const response = await authService.register(userData);

        saveToken(response.token);
        saveUser(response.user);

        setUser(response.user);
        setIsAuthenticated(true);
    };

    const logout = () => {
        clearStorage();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}