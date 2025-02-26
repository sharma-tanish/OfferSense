const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

// In-memory storage (simple example - not production ready)
const rateLimits = new Map();
const otpStorage = new Map();

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Twilio Verify service setup

console.log('Verify Service SID:', process.env.TWILIO_VERIFY_SERVICE_SID);

// Add this validation at the top
if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
  console.error('❌ TWILIO_VERIFY_SERVICE_SID is missing in .env file');
  process.exit(1);
}

// Remove .trim() and use direct assignment
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Add validation for the service SID format
if (!verifyServiceSid.startsWith('VA')) {
  console.error('❌ Invalid Verify Service SID format. Should start with "VA"');
  process.exit(1);
}

// Add validation check
if (!twilioClient) {
  console.error('Twilio client not initialized!');
  process.exit(1);
}

// Updated send-otp endpoint
router.post('/send-otp', async (req, res) => {
  console.log('Request Body:', req.body);
  const { mobile } = req.body;
  
  if (!/^\+\d{1,3}\d{9,15}$/.test(mobile)) {
    return res.status(400).json({ error: 'Invalid mobile format' });
  }

  try {
    // Simple in-memory rate limiting
    const attempts = rateLimits.get(mobile) || 0;
    if (attempts > 3) {
      return res.status(429).json({ error: 'Too many attempts' });
    }

    // Start Twilio verification
    await twilioClient.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: mobile, channel: 'sms' });

    // Update in-memory rate limit
    rateLimits.set(mobile, attempts + 1);
    setTimeout(() => rateLimits.delete(mobile), 3600 * 1000); // 1 hour timeout

    res.json({ success: true });
  } catch (error) {
    console.error('Full Error Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.message
    });
  }
});

// Updated verify-otp endpoint
router.post('/verify-otp', async (req, res) => {
  const { mobile, code } = req.body;
  
  try {
    // Verification remains the same as it uses Twilio's service
    const verificationCheck = await twilioClient.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: mobile, code: code.toString() });

    if (verificationCheck.status !== 'approved') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear in-memory rate limit
    rateLimits.delete(mobile);
    
    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router; 