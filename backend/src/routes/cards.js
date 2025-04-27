const express = require('express');
const router = express.Router();
const CardService = require('../services/cardService');

// Middleware to verify user
const verifyUser = (req, res, next) => {
  const userId = req.headers['user-id'];
  console.log('Received user-id header:', userId);
  console.log('All headers:', req.headers);
  
  if (!userId) {
    console.log('No user-id header found');
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  // Ensure consistent format for user ID
  req.userId = userId.startsWith('+') ? userId : `+${userId}`;
  console.log('Processed user ID:', req.userId);
  next();
};

// Add a new card
router.post('/add', verifyUser, async (req, res) => {
  try {
    const result = await CardService.addCard(req.userId, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all cards for a user
router.get('/', verifyUser, async (req, res) => {
  try {
    console.log('GET /cards request for user:', req.userId);
    
    const cards = await CardService.getCards(req.userId);
    console.log('Cards from service:', cards);
    
    // Ensure we're sending the cards array directly
    const response = {
      success: true,
      cards: cards || []
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in GET /cards route:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      cards: []
    });
  }
});

// Delete a card
router.delete('/:cardId', verifyUser, async (req, res) => {
  try {
    const result = await CardService.deleteCard(req.userId, req.params.cardId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router; 