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

    // Fetch card details from the database
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    // Compose a detailed system prompt
    const systemPrompt = `You are a helpful assistant that generates curated credit card offers for users.\n\nInstructions:\n• Use the 'get_current_datetime' tool to fetch the CURRENT DATE and TIME.\n• Only include offers that belong to the user's card type and card name (bank).\n• Generate 3 offer categories for each card: 1. Hotel Offers, 2. Flight Offers, 3. Tour Offers.\n• Refrain from mentioning offers that only include card details without belonging to any user choice category.\n• In the Offer Validity section, display only the ACTIVE offers whose validity ends after CURRENT DATE and TIME; label them as ACTIVE. Otherwise, label those offers as 'EXPIRED' and do not mention their validity duration.\n• Display the curated details clearly with labels.\n• Use a 'source_name' label for the URL provided.\n• Format the response as a **numbered list**.\n\nOutput Format Example:\n1. Offer Platform Name: ...\n   • Offer Details: ...\n   • Promo Code: ...\n   • Offer Validity: ...\n   • Source: ...\n2. Offer Platform Name: ...\n   • Offer Details: ...\n   • Promo Code: ...\n   • Offer Validity: ...\n   • Source: ...\n`;

    // Compose the user message
    const userMessage = `Generate 3 offers for each of the following categories: Hotel Offers, Flight Offers, Tour Offers.\nBank Name: ${card.bankName}\nCard Type: ${card.cardType}\nCurrent Date and Time: ${currentDateTime}\n${preferences ? `User preferences: ${JSON.stringify(preferences)}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 900
    });

    // Parse the generated offers
    let content = completion.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    // Optionally, you may want to return the raw content for frontend parsing if the format is not JSON
    // For now, just return the content as a string
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
      error: process.env.NODE_ENV !== 'production' ? (error.message || error.toString()) : 'Failed to generate offers'
    });
  }
});

module.exports = router;
