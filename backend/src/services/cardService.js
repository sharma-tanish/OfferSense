import Card from '../models/Card.js';
import crypto from 'crypto';

class CardService {
  // Generate a secure token for the card
  static generateToken(cardNumber) {
    return crypto.createHash('sha256').update(cardNumber).digest('hex');
  }

  // Add a new card
  static async addCard(userId, cardData) {
    try {
      // Validate required fields
      if (!cardData.cardNumber || !cardData.cardType || !cardData.cardName || !cardData.expiryDate) {
        return {
          success: false,
          error: 'Missing required fields',
          status: 400
        };
      }

      // Validate card number format
      const cardNumber = cardData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumber)) {
        return {
          success: false,
          error: 'Invalid card number format',
          status: 400
        };
      }

      // Validate expiry date format (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
        return {
          success: false,
          error: 'Invalid expiry date format (MM/YY)',
          status: 400
        };
      }

      const token = this.generateToken(cardNumber);
      const lastFourDigits = cardNumber.slice(-4);

      const newCard = new Card({
        userId,
        cardType: cardData.cardType,
        lastFourDigits,
        cardHolderName: cardData.cardName,
        expiryDate: cardData.expiryDate,
        token
      });

      await newCard.save();
      return {
        success: true,
        data: {
          id: newCard._id,
          cardType: newCard.cardType,
          lastFourDigits: newCard.lastFourDigits,
          cardHolderName: newCard.cardHolderName,
          expiryDate: newCard.expiryDate
        }
      };
    } catch (error) {
      console.error('Error adding card:', error);
      if (error.code === 11000) {
        return {
          success: false,
          error: 'Card already exists',
          status: 409
        };
      }
      return {
        success: false,
        error: 'Failed to add card',
        status: 500
      };
    }
  }

  // Get all cards for a user
  static async getCards(userId) {
    try {
      const cards = await Card.find({ userId });
      return {
        success: true,
        data: cards.map(card => ({
          id: card._id,
          cardType: card.cardType,
          lastFourDigits: card.lastFourDigits,
          cardHolderName: card.cardHolderName,
          expiryDate: card.expiryDate
        }))
      };
    } catch (error) {
      console.error('Error getting cards:', error);
      return {
        success: false,
        error: 'Failed to get cards',
        status: 500
      };
    }
  }

  // Delete a card
  static async deleteCard(userId, cardId) {
    try {
      const result = await Card.findOneAndDelete({ _id: cardId, userId });
      if (!result) {
        return {
          success: false,
          error: 'Card not found',
          status: 404
        };
      }
      return { 
        success: true,
        data: { message: 'Card deleted successfully' }
      };
    } catch (error) {
      console.error('Error deleting card:', error);
      return {
        success: false,
        error: 'Failed to delete card',
        status: 500
      };
    }
  }
}

export default CardService; 