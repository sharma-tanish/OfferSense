const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Disable SSL verification for development only
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configure Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Validate Twilio credentials
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
    console.error('❌ Missing required Twilio environment variables');
    console.log('Required variables:');
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✓' : '❌');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✓' : '❌');
    console.log('TWILIO_VERIFY_SERVICE_SID:', process.env.TWILIO_VERIFY_SERVICE_SID ? '✓' : '❌');
}

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { mobile } = req.body;
        
        // Validate mobile number
        if (!mobile) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mobile number is required' 
            });
        }

        // Validate phone number format (should start with + and country code)
        if (!/^\+[1-9]\d{1,14}$/.test(mobile)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid phone number format. Must include country code (e.g., +91xxxxxxxxxx)' 
            });
        }

        console.log('Request received for mobile:', mobile);
        console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 8) + '...');
        console.log('Verify Service SID:', process.env.TWILIO_VERIFY_SERVICE_SID?.substring(0, 8) + '...');
        
        const verification = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
                to: mobile,
                channel: 'sms'
            });

        console.log('Verification initiated successfully:', {
            status: verification.status,
            sid: verification.sid,
            to: verification.to
        });
        
        res.json({ 
            success: true, 
            status: verification.status,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Detailed error sending OTP:', {
            message: error.message,
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo
        });
        
        // Handle specific Twilio error codes
        if (error.code === 60200) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format',
                details: 'Please provide a valid phone number with country code (e.g., +91xxxxxxxxxx)'
            });
        }
        
        // Send a more detailed error response
        res.status(500).json({ 
            success: false, 
            error: error.message,
            code: error.code,
            details: 'Error sending OTP. Please check the phone number format (+[country_code][number]) and try again.'
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobile, code } = req.body;
        
        const verification_check = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
                to: mobile,
                code: code
            });

        if (verification_check.status === 'approved') {
            res.json({ success: true, status: 'approved' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router; 