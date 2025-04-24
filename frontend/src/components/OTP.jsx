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
                // Store verification status and phone number
                localStorage.setItem('isVerified', 'true');
                localStorage.setItem('phoneNumber', mobile);
                
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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Enter OTP</h2>
                <p className="text-gray-400 mb-6">
                    We've sent a verification code to {mobile}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                name="otp"
                                maxLength="1"
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className="w-12 h-12 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTP;