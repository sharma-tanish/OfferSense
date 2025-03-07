import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState("");  // Add error state
    const navigate = useNavigate();
    const location = useLocation();
    const mobile = location.state?.mobile || ''; // Get mobile from navigation state

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
        setError(""); // Clear any previous errors
        const enteredOtp = otp.join("");
        
        try {
            const response = await fetch('/api/otp/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    mobile: mobile,
                    code: enteredOtp  // Changed from 'otp' to 'code' to match backend
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    navigate("/next-page");
                } else {
                    setError(data.message || "Verification failed");
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to verify OTP");
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError("Network error - please try again");
        }
    };

    return (
        <div className="bg-black min-h-screen flex items-center justify-center">
            <div className="flex flex-col space-y-4 w-[400px] mx-auto border border-white rounded-2xl p-10">
                <p className="text-[32px] font-bold text-white">Enter OTP</p>
                {error && (
                    <div className="text-red-500 text-sm text-center">
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
                                className="w-10 h-10 text-center text-white bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="bg-white text-zinc-950 hover:bg-white/90 active:bg-white/80 flex w-full mt-6 items-center justify-center rounded-lg px-4 py-4 text-base font-medium cursor-pointer"
                    >
                        Verify OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTP;