import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
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
        const enteredOtp = otp.join("");
        console.log("Entered OTP:", enteredOtp);

        // Use environment variable for base URL
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/otp/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile: "+91" + mobile, code: enteredOtp }), // Ensure mobile is passed
        });

        if (response.ok) {
            navigate("/next-page"); // Replace with your desired route
        } else {
            const errorData = await response.json();
            console.error("Error verifying OTP:", errorData.error);
            // Handle error (e.g., show a message to the user)
        }
    };

    return (
        <div className="bg-black min-h-screen flex items-center justify-center">
            <div className="flex flex-col space-y-4 w-[400px] mx-auto border border-white rounded-2xl p-10">
                <p className="text-[32px] font-bold text-white">Enter OTP</p>
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