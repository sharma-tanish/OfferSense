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
  '+919631924059'  // Your verified number
];

class OTPService {
  static formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If number starts with 91, add + prefix
    if (digits.startsWith('91')) {
      return `+${digits}`;
    }
    
    // If number starts with 0, remove it and add +91
    if (digits.startsWith('0')) {
      return `+91${digits.substring(1)}`;
    }
    
    // If number is 10 digits, add +91
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    
    // If number already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    return phoneNumber;
  }

  static async sendOTP(phoneNumber) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('Attempting to send OTP to:', formattedNumber);
      console.log('Using Twilio credentials:', {
        accountSid: accountSid ? 'Present' : 'Missing',
        verifyServiceSid: verifyServiceSid ? 'Present' : 'Missing'
      });

      // Check if the number is verified for trial account
      if (!verifiedNumbers.includes(formattedNumber)) {
        console.log('Phone number not verified:', formattedNumber);
        return {
          success: false,
          message: 'This phone number is not verified. Please use a verified number for testing.'
        };
      }

      const verification = await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: formattedNumber, channel: 'sms' });

      console.log('OTP sent successfully:', verification.sid);
      return {
        success: true,
        message: 'OTP sent successfully',
        verificationSid: verification.sid
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        moreInfo: error.moreInfo
      });
      return {
        success: false,
        message: error.message || 'Failed to send OTP',
        details: error.moreInfo || 'Please check your Twilio credentials and service configuration'
      };
    }
  }

  static async verifyOTP(phoneNumber, code) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('Attempting to verify OTP for:', formattedNumber);

      // Check if the number is verified for trial account
      if (!verifiedNumbers.includes(formattedNumber)) {
        console.log('Phone number not verified:', formattedNumber);
        return {
          success: false,
          message: 'This phone number is not verified. Please use a verified number for testing.'
        };
      }

      const verificationCheck = await client.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: formattedNumber, code });

      console.log('Verification result:', verificationCheck.status);
      return {
        success: verificationCheck.status === 'approved',
        message: verificationCheck.status === 'approved' ? 'OTP verified successfully' : 'Invalid OTP'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        moreInfo: error.moreInfo
      });
      return {
        success: false,
        message: error.message || 'Failed to verify OTP',
        details: error.moreInfo || 'Please check the OTP code and try again'
      };
    }
  }
}

module.exports = OTPService; 