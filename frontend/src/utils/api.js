const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (!token || !userId) {
    throw new Error('Authentication required');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'user-id': userId
  };
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const api = {
  get: async (endpoint, requiresAuth = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: requiresAuth ? getAuthHeaders() : getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  post: async (endpoint, data, requiresAuth = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: requiresAuth ? getAuthHeaders() : getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  delete: async (endpoint, requiresAuth = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: requiresAuth ? getAuthHeaders() : getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
};

export default api; 