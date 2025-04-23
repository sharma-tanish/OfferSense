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
            const response = await fetch('/api/otp/verify-otp', {
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
                // Store authentication data
                localStorage.setItem('isVerified', 'true');
                localStorage.setItem('phoneNumber', mobile);
                localStorage.setItem('token', data.token); // Store the token
                localStorage.setItem('userId', data.userId); // Store the user ID
                
                // Navigate to my-cards page and replace history
                navigate("/my-cards", { replace: true });
            } else {
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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Enter OTP</h2>
                <p className="text-gray-400 mb-6">
                    We have sent an OTP to {mobile}
                </p>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                name="otp"
                                maxLength="1"
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
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