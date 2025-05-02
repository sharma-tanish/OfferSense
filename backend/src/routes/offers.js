const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Card = require('../models/Card');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const currentDateTime = new Date().toISOString();
    const { cardId, preferences } = req.body;

    console.log('Received request for offers:', { cardId, preferences });

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set');
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured'
      });
    }

    // Fetch card details from the database
    const card = await Card.findById(cardId);
    if (!card) {
      console.error('Card not found:', cardId);
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    console.log('Found card:', {
      bankName: card.bankName,
      cardType: card.cardType
    });

    // Compose a detailed system prompt
    const systemPrompt = `You are a helpful assistant that generates curated credit card offers for users.

Instructions:
• Generate realistic and current offers based on the card type and bank name.
• Generate 3 offer categories: 1. Hotel Offers, 2. Flight Offers, 3. Tour Offers.
• For each category, provide 2-3 specific offers.
• Each offer should include:
  - Platform/Merchant name
  - Specific discount or cashback details
  - Any minimum spend requirements
  - Valid promo code
  - Validity period (use current date as reference)
• Make offers relevant to the card type (VISA/MASTERCARD/RUPAY/AMEX) and bank.
• Format each category clearly with proper spacing and bullet points.

Current Date and Time: ${currentDateTime}
Card Details:
- Bank: ${card.bankName}
- Type: ${card.cardType}`;

    console.log('Sending request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate current and realistic offers for this card." }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    console.log('Received response from OpenAI');

    // Parse the generated offers
    let content = completion.choices[0].message.content.trim();
    
    console.log('Generated offers:', content);

    res.json({
      success: true,
      currentDateTime,
      offers: content
    });
  } catch (error) {
    console.error('Error generating offers:', error);
    if (error.response) {
      console.error('OpenAI API response error:', error.response.data);
    }
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Failed to generate offers' 
        : `Error: ${error.message || error.toString()}`
    });
  }
});

module.exports = router;
