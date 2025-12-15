import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:5000/api';

const fetchWrapper = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json().catch(() => ({})); // Handle empty bodies

        if (!response.ok) {
            const errorMessage = data.error || 'Something went wrong';
            // Display Toast for all errors automatically
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        // If it's a network error (fetch throws), show a generic message if one wasn't already shown
        if (error.message === 'Failed to fetch') {
            toast.error("Network Error: Could not connect to server.");
        }
        // Re-throw so components can handle loading states
        throw error;
    }
};

export const api = {
    get: (endpoint) => fetchWrapper(endpoint, { method: 'GET' }),
    post: (endpoint, body) => fetchWrapper(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => fetchWrapper(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => fetchWrapper(endpoint, { method: 'DELETE' }),
};
