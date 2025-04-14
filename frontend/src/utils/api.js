const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const api = {
  get: async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': localStorage.getItem('userId') || '',
        ...options.headers,
      },
    });
    return handleResponse(response);
  },

  post: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': localStorage.getItem('userId') || '',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': localStorage.getItem('userId') || '',
        ...options.headers,
      },
    });
    return handleResponse(response);
  },
};

export default api; 