const API_BASE_URL = import.meta.env.DEV 
    ? "/api" 
    : (import.meta.env.VITE_API_BASE_URL || "https://organize-api-pedf.onrender.com");

export default API_BASE_URL;