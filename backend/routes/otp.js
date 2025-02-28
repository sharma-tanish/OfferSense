const express = require('express');
const router = express.Router();
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' });
    
    res.json({ success: true, status: verification.status });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    res.json({ valid: verification_check.valid, status: verification_check.status });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 