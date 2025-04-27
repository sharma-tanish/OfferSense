import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [mobile, setMobile] = useState("");
    const [countryCode, setCountryCode] = useState('+91');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Ensure mobile number is clean and properly formatted
        const cleanMobile = mobile.replace(/\D/g, ''); // Remove non-digits
        const formattedMobile = `${countryCode}${cleanMobile}`; // Format with country code
        
        console.log("Sending OTP to:", formattedMobile);
        
        try {
            const response = await fetch('/api/otp/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: formattedMobile }),
            });

            const data = await response.json();
            console.log("Response:", data);

            if (response.ok && data.success) {
                localStorage.setItem('authenticatedUser', formattedMobile);
                navigate("/otp", { state: { mobile: formattedMobile } });
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Network error - please check your connection');
        }
    };

    return (
        <div className=" bg-black min-h-screen overflow-hidden">
            <header className="absolute inset-x-0 top-0 z-10 py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center space-x-10 justify-end mr-12 mt-3">
                        <Link
                            to="/"
                            className="font-sans text-white"
                        >
                            Home
                        </Link>
                    </div>
                </div>
            </header>

            <div className="relative my-auto mx-auto mt-[130px] z-10">
                <div className="flex flex-col space-y-15">
                    <div className="flex items-center justify-center w-100 mx-auto">
                        <img src={logo} alt="OfferSense" />
                    </div>
                    <div className="flex flex-col w-[550px] mx-auto space-y-4 border border-white rounded-2xl p-10">
                        <p className="text-[32px] font-bold text-white">Log In</p>
                        <form onSubmit={handleSubmit} className="mb-4">
                            <div className="grid gap-2">
                                <label className="text-white" htmlFor="mobile">Enter your mobile number to login!</label>
                                <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-950 px-4 py-3">
                                    <span className="text-white mr-2">{countryCode}</span>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        placeholder="Enter your mobile number"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="h-full min-h-[44px] w-full bg-transparent text-white text-md placeholder:text-zinc-400 focus:outline-none"
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-white text-zinc-950 hover:bg-white/90 active:bg-white/80 flex w-full mt-6 items-center justify-center rounded-lg px-4 py-4 text-base font-medium cursor-pointer"
                                >
                                    Send OTP
                                </button>
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm mt-2">
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;