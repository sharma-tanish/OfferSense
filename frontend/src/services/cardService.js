import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const cardService = {
  async addCard(cardData) {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      console.log('Adding card with phoneNumber:', phoneNumber);
      console.log('Card data:', cardData);

      const response = await axios.post(`${API_URL}/cards`, cardData, {
        headers: {
          'x-phone-number': phoneNumber
        }
      });
      console.log('Add card response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding card:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to add card');
    }
  },

  async getCards() {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      console.log('Getting cards for phoneNumber:', phoneNumber);

      const response = await axios.get(`${API_URL}/cards`, {
        headers: {
          'x-phone-number': phoneNumber
        }
      });
      console.log('Get cards response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch cards');
      }

      const cardsArray = Array.isArray(response.data.cards) ? response.data.cards : [];
      console.log('Processed cards array:', cardsArray);
      return cardsArray;
    } catch (error) {
      console.error('Error fetching cards:', error.response?.data || error.message);
      return [];
    }
  },

  async deleteCard(cardId) {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      console.log('Deleting card with phoneNumber:', phoneNumber);
      console.log('Card ID:', cardId);

      const response = await axios.delete(`${API_URL}/cards/${cardId}`, {
        headers: {
          'x-phone-number': phoneNumber
        }
      });
      console.log('Delete card response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting card:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete card');
    }
  }
};

export default cardService; 