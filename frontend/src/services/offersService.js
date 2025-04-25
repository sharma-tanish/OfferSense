import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getOffersForCards = async (cards) => {
  try {
    const phoneNumber = localStorage.getItem('phoneNumber');
    if (!phoneNumber) {
      throw new Error('User not authenticated');
    }

    const response = await axios.post(`${API_URL}/offers`, { cards }, {
      headers: {
        'x-phone-number': phoneNumber,
        'Accept': 'application/json'
      }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch offers');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting offers:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch offers');
  }
};

export const getOfferDetails = async (offerId) => {
  try {
    const response = await axios.get(`${API_URL}/offers/${offerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch offer details');
  }
}; 