import express from 'express';
import offerScraperService from '../services/offerScraperService.js';
import Card from '../models/Card.js';

const router = express.Router();

// Middleware to verify user
const verifyUser = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// Get offers for all user's cards
router.post('/batch', verifyUser, async (req, res) => {
  try {
    // Get all user's cards
    const cards = await Card.find({ userId: req.userId });
    
    if (!cards.length) {
      return res.status(404).json({ message: 'No cards found' });
    }

    // Get offers for each card
    const allOffers = [];
    for (const card of cards) {
      const offers = await offerScraperService.getOffersForCard({
        cardType: card.cardType,
        bankName: card.bankName,
        lastFourDigits: card.lastFourDigits
      });
      
      allOffers.push(...offers.map(offer => ({
        ...offer,
        cardId: card._id
      })));
    }

    res.json({ offers: allOffers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Failed to fetch offers' });
  }
});

// Get offers for a specific card
router.post('/card/:cardId', verifyUser, async (req, res) => {
  try {
    const card = await Card.findOne({ 
      _id: req.params.cardId,
      userId: req.userId 
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const offers = await offerScraperService.getOffersForCard({
      cardType: card.cardType,
      bankName: card.bankName,
      lastFourDigits: card.lastFourDigits
    });

    res.json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Failed to fetch offers' });
  }
});

export default router; 