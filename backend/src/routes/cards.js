import express from 'express';
import CardService from '../services/cardService.js';

const router = express.Router();

// Middleware to verify user ID
const verifyUser = (req, res, next) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  // Add user ID to request object
  req.userId = userId;
  next();
};

// Add a new card
router.post('/add', verifyUser, async (req, res) => {
  try {
    const cardData = {
      ...req.body,
      userId: req.userId
    };

    const result = await CardService.addCard(req.userId, cardData);
    
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add card'
    });
  }
});

// Get all cards for a user
router.get('/', verifyUser, async (req, res) => {
  try {
    const result = await CardService.getCards(req.userId);
    
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cards'
    });
  }
});

// Delete a card
router.delete('/:cardId', verifyUser, async (req, res) => {
  try {
    const result = await CardService.deleteCard(req.userId, req.params.cardId);
    
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete card'
    });
  }
});

export default router; 