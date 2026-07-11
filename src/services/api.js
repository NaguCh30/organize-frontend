import API_BASE_URL from "../config/api";
import { getToken, clearStorage } from "../utils/storage";

async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token && !endpoint.includes("/auth/")) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if ((response.status === 401 || response.status === 403) && !endpoint.includes("/auth/")) {
        clearStorage();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
    }

    let data = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch (e) {
            // Safe fallback if JSON parsing fails on empty/malformed text
        }
    }

    if (!response.ok) {
        if (data && data.message) {
            throw new Error(data.message);
        }

        if (data && typeof data === "object" && Object.keys(data).length > 0) {
            throw new Error(Object.values(data).join("\n"));
        }

        throw new Error("Something went wrong");
    }

    return data;
}

export default request;