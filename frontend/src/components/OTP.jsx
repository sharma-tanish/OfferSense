import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const mobile = location.state?.mobile || '';

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevSibling = e.target.previousSibling;
            if (prevSibling) {
                prevSibling.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const enteredOtp = otp.join("");
        
        try {
            const response = await fetch('http://localhost:5000/api/otp/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    phoneNumber: mobile,
                    code: enteredOtp
                }),
            });

            const data = await response.json();
            console.log('Verification response:', data);

            if (response.ok && data.success) {
                console.log('OTP verification successful');
                // Store verification status and phone number
                localStorage.setItem('isVerified', 'true');
                localStorage.setItem('phoneNumber', mobile);
                
                console.log('Updated localStorage:', {
                    isVerified: localStorage.getItem('isVerified'),
                    phoneNumber: localStorage.getItem('phoneNumber')
                });
                
                // Navigate to my-cards page and replace history
                navigate("/my-cards", { replace: true });
            } else {
                console.error('OTP verification failed:', data);
                setError(data.message || "Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError("Network error - please try again");
        } finally {
            setLoading(false);
        }
    };

    if (!mobile) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <div className="text-white text-center">
                    <p>No phone number provided.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-blue-400 hover:text-blue-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen flex items-center justify-center">
            <div className="flex flex-col space-y-4 w-[400px] mx-auto border border-white rounded-2xl p-10">
                <p className="text-[32px] font-bold text-white">Enter OTP</p>
                <p className="text-gray-400">
                    Enter the verification code sent to {mobile}
                </p>
                {error && (
                    <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="flex justify-center space-x-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                className="w-12 h-12 text-center text-white bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 text-xl"
                                disabled={loading}
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white text-zinc-950 hover:bg-white/90 active:bg-white/80 flex w-full mt-6 items-center justify-center rounded-lg px-4 py-4 text-base font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </div>
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTP;