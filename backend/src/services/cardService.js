const Card = require('../models/Card');
const crypto = require('crypto');

class CardService {
  // Generate a secure token for the card
  static generateToken(cardNumber) {
    return crypto.createHash('sha256').update(cardNumber).digest('hex');
  }

  // Add a new card
  static async addCard(userId, cardData) {
    try {
      const token = this.generateToken(cardData.cardNumber);
      const lastFourDigits = cardData.cardNumber.slice(-4);

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
        card: {
          id: newCard._id,
          cardType: newCard.cardType,
          lastFourDigits: newCard.lastFourDigits,
          cardHolderName: newCard.cardHolderName,
          expiryDate: newCard.expiryDate
        }
      };
    } catch (error) {
      console.error('Error adding card:', error);
      return {
        success: false,
        error: 'Failed to add card'
      };
    }
  }

  // Get all cards for a user
  static async getCards(userId) {
    try {
      const cards = await Card.find({ userId });
      return cards.map(card => ({
        id: card._id,
        cardType: card.cardType,
        lastFourDigits: card.lastFourDigits,
        cardHolderName: card.cardHolderName,
        expiryDate: card.expiryDate
      }));
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  // Delete a card
  static async deleteCard(userId, cardId) {
    try {
      const card = await Card.findOneAndDelete({ _id: cardId, userId });
      if (!card) {
        return {
          success: false,
          error: 'Card not found or unauthorized'
        };
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting card:', error);
      return {
        success: false,
        error: 'Failed to delete card'
      };
    }
  }
}

module.exports = CardService; 