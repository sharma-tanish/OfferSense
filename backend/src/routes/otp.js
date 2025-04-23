import express from 'express';
import OTPService from '../services/otpService.js';

const router = express.Router();

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Format phone number to E.164 format if needed
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const result = await OTPService.sendOTP(formattedNumber);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        verificationSid: result.verificationSid
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in send-otp route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required'
      });
    }

    // Format phone number to E.164 format if needed
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    console.log('Verifying OTP:', {
      phoneNumber: formattedNumber,
      code: code
    });
    
    const result = await OTPService.verifyOTP(formattedNumber, code);
    
    console.log('Verification result:', result);
    
    if (result.success) {
      // Generate a user ID
      const userId = `user_${Date.now()}`;

      res.json({
        success: true,
        message: result.message,
        userId,
        redirectTo: '/my-cards'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router; 