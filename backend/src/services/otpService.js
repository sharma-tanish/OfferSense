const twilio = require('twilio');
require('dotenv').config();

// Disable SSL verification in development mode
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Create Twilio client
const client = twilio(accountSid, authToken);

// List of verified phone numbers for trial account
const verifiedNumbers = [
  '+919572264601'  // Your verified number
];

class OTPService {
  static async sendOTP(phoneNumber) {
    try {
      // Check if the number is verified for trial account
      if (!verifiedNumbers.includes(phoneNumber)) {
        return {
          success: false,
          message: 'This phone number is not verified. Please use a verified number for testing.'
        };
      }

      const verification = await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' });

      return {
        success: true,
        message: 'OTP sent successfully',
        verificationSid: verification.sid
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  static async verifyOTP(phoneNumber, code) {
    try {
      // Check if the number is verified for trial account
      if (!verifiedNumbers.includes(phoneNumber)) {
        return {
          success: false,
          message: 'This phone number is not verified. Please use a verified number for testing.'
        };
      }

      const verificationCheck = await client.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: phoneNumber, code });

      return {
        success: verificationCheck.status === 'approved',
        message: verificationCheck.status === 'approved' ? 'OTP verified successfully' : 'Invalid OTP'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP'
      };
    }
  }
}

module.exports = OTPService; 