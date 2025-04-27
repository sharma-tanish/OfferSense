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
      console.log('Adding card for user:', userId); // Debug log
      const token = this.generateToken(cardData.cardNumber);
      const lastFourDigits = cardData.cardNumber.slice(-4);

      // Ensure consistent format for user ID
      const formattedUserId = userId.startsWith('+') ? userId : `+${userId}`;
      console.log('Formatted user ID:', formattedUserId);

      const newCard = new Card({
        userId: formattedUserId,
        cardType: cardData.cardType,
        bankName: cardData.bankName,
        lastFourDigits,
        cardHolderName: cardData.cardName,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
        token
      });

      console.log('Attempting to save card:', {
        userId: formattedUserId,
        cardType: cardData.cardType,
        bankName: cardData.bankName,
        lastFourDigits,
        cardHolderName: cardData.cardName,
        expiryDate: cardData.expiryDate
      });

      await newCard.save();
      console.log('Card saved successfully:', newCard); // Debug log

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
        error: 'Failed to add card'
      };
    }
  }

  // Get all cards for a user
  static async getCards(userId) {
    try {
      // Ensure consistent format for user ID
      const formattedUserId = userId.startsWith('+') ? userId : `+${userId}`;
      console.log('Getting cards for user:', formattedUserId);
      console.log('Database query:', { userId: formattedUserId });
      
      // Test database connection
      const db = Card.db;
      console.log('Database connection state:', db.readyState);
      
      // First check if the user exists in the database
      const userCards = await Card.find({ userId: formattedUserId });
      console.log('Raw database response:', userCards);
      console.log('Number of cards found:', userCards.length);
      
      if (!userCards || userCards.length === 0) {
        console.log('No cards found for user:', formattedUserId);
        return [];
      }
      
      // Format the cards array
      const formattedCards = userCards.map(card => {
        console.log('Processing card:', card);
        const formattedCard = {
          _id: card._id.toString(), // Convert ObjectId to string
          cardType: card.cardType,
          bankName: card.bankName,
          lastFourDigits: card.lastFourDigits,
          cardHolderName: card.cardHolderName,
          expiryDate: card.expiryDate
        };
        console.log('Formatted card:', formattedCard);
        return formattedCard;
      });

      console.log('Final formatted cards:', formattedCards);
      return formattedCards;
    } catch (error) {
      console.error('Error in getCards:', error);
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