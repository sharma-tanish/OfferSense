import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Disable SSL verification in development mode
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Initialize Twilio client only if we're in production
const client = process.env.NODE_ENV === 'production' ? twilio(accountSid, authToken) : null;

// List of verified phone numbers for trial account
const verifiedNumbers = [
  '+919631924059'  // Your verified number
];

// Mock OTP storage for development
const mockOTPs = new Map();

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

      if (process.env.NODE_ENV === 'production') {
        // Production: Use Twilio
        const verification = await client.verify.v2
          .services(verifyServiceSid)
          .verifications.create({ to: formattedNumber, channel: 'sms' });

        console.log('OTP sent successfully:', verification.sid);
        return {
          success: true,
          message: 'OTP sent successfully',
          verificationSid: verification.sid
        };
      } else {
        // Development: Use mock OTP
        const mockOTP = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        mockOTPs.set(formattedNumber, mockOTP);
        
        console.log('Mock OTP sent:', mockOTP);
        return {
          success: true,
          message: 'OTP sent successfully',
          verificationSid: 'mock_verification_sid'
        };
      }
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

      if (process.env.NODE_ENV === 'production') {
        // Production: Use Twilio
        const verificationCheck = await client.verify.v2
          .services(verifyServiceSid)
          .verificationChecks.create({ to: formattedNumber, code });

        console.log('Verification result:', verificationCheck.status);
        return {
          success: verificationCheck.status === 'approved',
          message: verificationCheck.status === 'approved' ? 'OTP verified successfully' : 'Invalid OTP'
        };
      } else {
        // Development: Use mock verification
        const storedOTP = mockOTPs.get(formattedNumber);
        const isValid = storedOTP === code;
        
        if (isValid) {
          mockOTPs.delete(formattedNumber); // Clear the OTP after successful verification
        }
        
        console.log('Mock verification result:', isValid ? 'approved' : 'rejected');
        return {
          success: isValid,
          message: isValid ? 'OTP verified successfully' : 'Invalid OTP'
        };
      }
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

export default OTPService; 