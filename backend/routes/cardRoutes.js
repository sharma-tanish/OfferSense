const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Card model schema
const Card = require('../models/Card');

// Get all cards for a user
router.get('/api/cards', auth, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id });
    res.json(cards);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Add a new card
router.post('/api/cards', auth, async (req, res) => {
  try {
    const { cardNumber, cardType, cardName, expiryDate } = req.body;
    
    const newCard = new Card({
      userId: req.user.id,
      cardNumber,
      cardType,
      cardName,
      expiryDate
    });

    const card = await newCard.save();
    res.json(card);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router; 