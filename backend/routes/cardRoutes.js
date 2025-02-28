const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Card = require('../models/Card');

// Get all cards for a user
router.get('/api/cards', auth, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Latest first
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Server error while fetching cards' });
  }
});

// Add a new card
router.post('/api/cards', auth, async (req, res) => {
  try {
    const { cardNumber, cardType, cardName, expiryDate } = req.body;

    // Basic validation
    if (!cardNumber || !cardType || !cardName || !expiryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if card already exists
    const existingCard = await Card.findOne({ cardNumber });
    if (existingCard) {
      return res.status(400).json({ message: 'This card is already registered' });
    }

    const newCard = new Card({
      userId: req.user.id,
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
      cardType,
      cardName: cardName.toUpperCase(),
      expiryDate: new Date(expiryDate)
    });

    const savedCard = await newCard.save();
    res.status(201).json(savedCard);

  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ message: 'Server error while adding card' });
  }
});

module.exports = router; 