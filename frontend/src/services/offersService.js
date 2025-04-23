import api from '../utils/api';

export const getOffersForCards = async (cards) => {
  try {
    const response = await api.post('/offers/batch', { cards });
    return response.data || { offers: [] };
  } catch (error) {
    console.error('Get offers for cards error:', error);
    if (error.message.includes('401')) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error(error.message || 'Failed to fetch offers');
  }
};

export const getOffersForCard = async (cardId) => {
  try {
    const response = await api.get(`/offers/card/${cardId}`);
    return response.data || { offers: [] };
  } catch (error) {
    console.error('Get offers for card error:', error);
    if (error.message.includes('401')) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error(error.message || 'Failed to fetch offers');
  }
}; 