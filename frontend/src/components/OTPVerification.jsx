import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Prevent pasting multiple digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if current input is filled
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          code: otpCode,
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      if (data.success) {
        // Store verification status in localStorage
        localStorage.setItem('isVerified', 'true');
        localStorage.setItem('phoneNumber', phoneNumber);
        
        // Navigate directly to my-cards page
        navigate('/my-cards', { replace: true });
      } else {
        setError(data.message || 'Failed to verify OTP');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-500">Phone number not found. Please go back and try again.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-500 hover:text-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md text-white">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-white/80 hover:text-white mr-4"
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Verify OTP</h2>
        </div>

        <p className="text-gray-300 mb-6">
          Enter the 6-digit code sent to {phoneNumber}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl bg-white/10 border border-white/20 rounded focus:outline-none focus:border-indigo-500 text-white"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center">
                <FaCheck className="mr-2" />
                Verify OTP
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification; 