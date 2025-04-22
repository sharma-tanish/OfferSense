import api from '../utils/api';

export const addCard = async (cardData) => {
  try {
    const response = await api.post('/cards/add', cardData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add card');
  }
};

export const getCards = async () => {
  try {
    const response = await api.get('/cards');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cards');
  }
};

export const deleteCard = async (cardId) => {
  try {
    const response = await api.delete(`/cards/${cardId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete card');
  }
}; 