import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpInput from 'react-otp-input';

const OTP = () => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone || '';

    useEffect(() => {
        // Send OTP when component mounts
        if (phone) {
            sendOTP();
        }
    }, [phone]);

    const sendOTP = async () => {
        try {
            const response = await fetch('/otp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone }),
            });

            const data = await response.json();
            if (!data.success) {
                alert('Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Failed to send OTP');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    phone: phone,
                    code: otp 
                }),
            });

            const data = await response.json();
            console.log('Verification response:', data); // Debug log

            if (data.valid || data.status === 'approved') {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userPhone', phone);
                navigate('/my-cards');
            } else {
                alert('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error during verification:', error);
            alert('Failed to verify OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Enter OTP
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Please enter the OTP sent to {phone}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="flex justify-center">
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={4}
                            renderInput={(props) => <input {...props} />}
                            inputStyle={{
                                width: '3rem',
                                height: '3rem',
                                margin: '0 0.5rem',
                                fontSize: '1.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #374151',
                                backgroundColor: 'rgba(55, 65, 81, 0.5)',
                                color: 'white',
                                textAlign: 'center',
                            }}
                            containerStyle="gap-2"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Verify OTP
                        </button>
                    </div>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={sendOTP}
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTP;