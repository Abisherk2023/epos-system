import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Add authentication token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle authentication errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        if (error.response?.status === 401) {

            console.warn(
                "Authentication expired. Logging out..."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("currentPage");

            // Reload application so App.jsx
            // displays the Login page.
            window.location.reload();
        }

        return Promise.reject(error);
    }
);

export default api;