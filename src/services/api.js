import API_BASE_URL from "../config/api";
import { getToken } from "../utils/storage";

async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {

        if (data.message) {
            throw new Error(data.message);
        }

        if (typeof data === "object") {
            throw new Error(Object.values(data).join("\n"));
        }

        throw new Error("Something went wrong");
    }

    return data;
}

export default request;