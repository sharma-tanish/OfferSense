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
      console.log('Adding card with data:', { userId, ...cardData });
      
      const lastFourDigits = cardData.cardNumber.slice(-4);
      
      const newCard = new Card({
        userId,
        cardNumber: cardData.cardNumber,
        cardHolderName: cardData.cardName,
        expiryDate: cardData.expiryDate,
        cardType: cardData.cardType,
        bankName: cardData.bankName,
        lastFourDigits
      });

      await newCard.save();
      console.log('Card saved successfully:', newCard);

      return {
        success: true,
        card: {
          _id: newCard._id,
          cardType: newCard.cardType,
          bankName: newCard.bankName,
          lastFourDigits: newCard.lastFourDigits,
          cardHolderName: newCard.cardHolderName,
          expiryDate: newCard.expiryDate
        }
      };
    } catch (error) {
      console.error('Error adding card:', error);
      return {
        success: false,
        error: error.message || 'Failed to add card'
      };
    }
  }

  // Get all cards for a user
  static async getCards(userId) {
    try {
      console.log('Fetching cards for userId:', userId);
      
      // First, check if any cards exist for this user
      const count = await Card.countDocuments({ userId });
      console.log(`Found ${count} cards for user ${userId}`);
      
      const cards = await Card.find({ userId }).sort({ createdAt: -1 });
      console.log('Raw cards from DB:', JSON.stringify(cards, null, 2));
      
      const formattedCards = cards.map(card => ({
        _id: card._id,
        cardType: card.cardType,
        bankName: card.bankName,
        lastFourDigits: card.lastFourDigits,
        cardHolderName: card.cardHolderName,
        expiryDate: card.expiryDate
      }));
      
      console.log('Formatted cards:', JSON.stringify(formattedCards, null, 2));
      
      return {
        success: true,
        cards: formattedCards
      };
    } catch (error) {
      console.error('Error getting cards:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch cards',
        cards: []
      };
    }
  }

  // Delete a card
  static async deleteCard(userId, cardId) {
    try {
      console.log('Deleting card:', { userId, cardId });
      const result = await Card.findOneAndDelete({ _id: cardId, userId });
      
      if (!result) {
        return {
          success: false,
          error: 'Card not found or unauthorized'
        };
      }
      
      console.log('Card deleted successfully:', result);
      return { success: true };
    } catch (error) {
      console.error('Error deleting card:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete card'
      };
    }
  }
}

module.exports = CardService; 