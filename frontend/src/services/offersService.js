import api from '../utils/api';

export const getOffersForCards = async (cards) => {
  try {
    const response = await api.post('/offers/batch', {
      cards: cards.map(card => ({
        cardId: card.id,
        cardType: card.cardType,
        bankName: card.bankName,
        lastFourDigits: card.cardNumber.slice(-4)
      }))
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch offers');
  }
}; 