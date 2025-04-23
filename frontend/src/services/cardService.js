import api from '../utils/api';

export const addCard = async (cardData) => {
  try {
    // Transform the data to match backend expectations
    const transformedData = {
      cardNumber: cardData.cardNumber,
      cardType: cardData.cardType,
      cardName: cardData.cardHolderName,
      expiryDate: cardData.expiryDate
    };

    const response = await api.post('/cards/add', transformedData);
    return response;
  } catch (error) {
    console.error('Add card error:', error);
    if (error.message.includes('401')) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error(error.message || 'Failed to add card');
  }
};

export const getCards = async () => {
  try {
    const response = await api.get('/cards');
    return response.data || [];
  } catch (error) {
    console.error('Get cards error:', error);
    if (error.message.includes('401')) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error(error.message || 'Failed to fetch cards');
  }
};

export const deleteCard = async (cardId) => {
  try {
    const response = await api.delete(`/cards/${cardId}`);
    return response;
  } catch (error) {
    console.error('Delete card error:', error);
    if (error.message.includes('401')) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error(error.message || 'Failed to delete card');
  }
}; 