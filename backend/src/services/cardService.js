const Card = require('../models/Card');
const crypto = require('crypto');

class CardService {
  // Generate a secure token for the card using only the last 4 digits
  static generateToken(lastFourDigits) {
    return crypto.createHash('sha256').update(lastFourDigits).digest('hex');
  }

  // Add a new card
  static async addCard(userId, cardData) {
    try {
      console.log('Adding card with data:', {
        userId,
        cardData
      });

      // Validate required fields
      if (!cardData.cardNumber || !cardData.cardType || !cardData.bankName || 
          !cardData.cardName || !cardData.expiryDate) {
        console.log('Missing required fields:', {
          cardNumber: !!cardData.cardNumber,
          cardType: !!cardData.cardType,
          bankName: !!cardData.bankName,
          cardName: !!cardData.cardName,
          expiryDate: !!cardData.expiryDate
        });
        return {
          success: false,
          error: 'Missing required fields'
        };
      }

      const lastFourDigits = cardData.cardNumber.slice(-4);
      const formattedUserId = userId.startsWith('+') ? userId : `+${userId}`;

      // Check database connection
      const db = Card.db;
      if (db.readyState !== 1) {
        console.error('Database not connected. State:', db.readyState);
        return {
          success: false,
          error: 'Database connection error'
        };
      }

      try {
        // Check if card already exists for this user (only active cards)
        const existingCard = await Card.findOne({ 
          userId: formattedUserId,
          lastFourDigits: lastFourDigits,
          status: 'active'
        }).exec();

        console.log('Existing card check result:', existingCard);

        if (existingCard) {
          console.log('Card already exists for user:', {
            userId: formattedUserId,
            lastFourDigits
          });
          return {
            success: false,
            error: 'This card is already added'
          };
        }

        // Check if there's a deleted card that can be reactivated
        const deletedCard = await Card.findOne({
          userId: formattedUserId,
          lastFourDigits: lastFourDigits,
          status: 'deleted'
        }).exec();

        if (deletedCard) {
          // Update the deleted card with new information
          deletedCard.cardType = cardData.cardType;
          deletedCard.bankName = cardData.bankName;
          deletedCard.cardHolderName = cardData.cardName;
          deletedCard.expiryDate = cardData.expiryDate;
          deletedCard.status = 'active';
          
          await deletedCard.save();
          console.log('Reactivated previously deleted card:', deletedCard);

          return {
            success: true,
            card: {
              _id: deletedCard._id,
              cardType: deletedCard.cardType,
              bankName: deletedCard.bankName,
              lastFourDigits: deletedCard.lastFourDigits,
              cardHolderName: deletedCard.cardHolderName,
              expiryDate: deletedCard.expiryDate
            }
          };
        }

        const token = this.generateToken(lastFourDigits);

        const newCard = new Card({
          userId: formattedUserId,
          lastFourDigits,
          cardType: cardData.cardType,
          bankName: cardData.bankName,
          cardHolderName: cardData.cardName,
          expiryDate: cardData.expiryDate,
          token,
          status: 'active'
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
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        if (dbError.code === 11000) {
          // Handle duplicate key error
          return {
            success: false,
            error: 'This card is already added'
          };
        }
        throw dbError; // Re-throw other database errors
      }
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
      // Ensure consistent format for user ID
      const formattedUserId = userId.startsWith('+') ? userId : `+${userId}`;
      console.log('Getting cards for user:', formattedUserId);
      
      // Check database connection
      const db = Card.db;
      if (db.readyState !== 1) {
        console.error('Database not connected. State:', db.readyState);
        return [];
      }
      
      // Only get active cards
      const userCards = await Card.find({ 
        userId: formattedUserId,
        status: 'active'
      }).exec();
      console.log('Number of cards found:', userCards.length);
      
      if (!userCards || userCards.length === 0) {
        console.log('No cards found for user:', formattedUserId);
        return [];
      }
      
      // Format the cards array
      const formattedCards = userCards.map(card => ({
        _id: card._id.toString(),
        cardType: card.cardType,
        bankName: card.bankName,
        lastFourDigits: card.lastFourDigits,
        cardHolderName: card.cardHolderName,
        expiryDate: card.expiryDate
      }));

      return formattedCards;
    } catch (error) {
      console.error('Error in getCards:', error);
      return [];
    }
  }

  // Delete a card (soft delete)
  static async deleteCard(userId, cardId) {
    try {
      // Check database connection
      const db = Card.db;
      if (db.readyState !== 1) {
        console.error('Database not connected. State:', db.readyState);
        return {
          success: false,
          error: 'Database connection error'
        };
      }

      const formattedUserId = userId.startsWith('+') ? userId : `+${userId}`;
      
      // Find the card and update its status to 'deleted'
      const card = await Card.findOneAndUpdate(
        { _id: cardId, userId: formattedUserId },
        { status: 'deleted' },
        { new: true }
      ).exec();

      if (!card) {
        return {
          success: false,
          error: 'Card not found or unauthorized'
        };
      }

      console.log('Card soft deleted successfully:', cardId);
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