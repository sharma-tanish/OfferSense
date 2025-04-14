const express = require('express');
const router = express.Router();
const CardService = require('../services/cardService');

// Middleware to verify user
const verifyUser = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.userId = userId;
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
    const cards = await CardService.getCards(req.userId);
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
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