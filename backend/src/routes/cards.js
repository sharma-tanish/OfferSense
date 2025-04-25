const express = require('express');
const router = express.Router();
const CardService = require('../services/cardService');

// Middleware to verify user
const verifyUser = (req, res, next) => {
  const phoneNumber = req.headers['x-phone-number'];
  if (!phoneNumber) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.userId = phoneNumber;
  next();
};

// Add a new card
router.post('/', verifyUser, async (req, res) => {
  try {
    console.log('Adding card for userId:', req.userId);
    console.log('Request body:', req.body);
    
    const result = await CardService.addCard(req.userId, req.body);
    console.log('Add card result:', result);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error in add card route:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all cards for a user
router.get('/', verifyUser, async (req, res) => {
  try {
    console.log('Getting cards for userId:', req.userId);
    const result = await CardService.getCards(req.userId);
    console.log('Get cards result:', result);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error in get cards route:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete a card
router.delete('/:cardId', verifyUser, async (req, res) => {
  try {
    console.log('Deleting card for userId:', req.userId);
    console.log('Card ID:', req.params.cardId);
    
    const result = await CardService.deleteCard(req.userId, req.params.cardId);
    console.log('Delete card result:', result);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error in delete card route:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router; 