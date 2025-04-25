const express = require('express');
const router = express.Router();

// Middleware to verify user
const verifyUser = (req, res, next) => {
  const phoneNumber = req.headers['x-phone-number'];
  if (!phoneNumber) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.userId = phoneNumber;
  next();
};

// Get offers for cards
router.post('/', verifyUser, async (req, res) => {
  try {
    const { cards } = req.body;
    
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request. Cards array is required.' 
      });
    }

    // Mock offers for now
    const offers = cards.map(card => ({
      cardId: card._id,
      bankName: card.bankName,
      cardType: card.cardType,
      offers: [
        {
          id: '1',
          title: '10% Cashback on Amazon',
          description: 'Get 10% cashback on all Amazon purchases',
          validTill: '2024-12-31',
          minSpend: 1000,
          maxCashback: 500
        },
        {
          id: '2',
          title: '5% Cashback on Groceries',
          description: 'Get 5% cashback on all grocery purchases',
          validTill: '2024-12-31',
          minSpend: 500,
          maxCashback: 250
        }
      ]
    }));

    res.json({ 
      success: true, 
      offers 
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch offers' 
    });
  }
});

module.exports = router; 