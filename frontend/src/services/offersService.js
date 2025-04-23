import api from '../utils/api';

export const getOffersForCards = async (cards) => {
  try {
    const response = await api.post('/offers/batch', { cards });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch offers');
  }
};

export const getOffersForCard = async (cardId) => {
  try {
    const response = await api.post(`/offers/card/${cardId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch offers');
  }
}; 