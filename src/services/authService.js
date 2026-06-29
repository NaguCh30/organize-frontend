import request from "./api";

const authService = {

    register: async (userData) => {
        return await request("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData)
        });
    },

    login: async (credentials) => {
        return await request("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials)
        });
    }

};

export default authService;