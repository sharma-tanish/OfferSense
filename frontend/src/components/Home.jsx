import { FaGift } from "react-icons/fa";
import { Link } from "react-router-dom";
import bg from "../assets/home_bg.jpg";
import logo from "../assets/logo.png";

const Home = () => {
    return (
        <div className="relative bg-black pt-60 pb-32 min-h-screen overflow-x-hidden">
            <header className="absolute inset-x-0 top-0 z-10 py-8">
                <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
                    <div className="flex flex-shrink-0">
                        <Link
                            to="/"
                        >
                            <img className="w-auto h-8" src={logo} alt="OfferSense" />
                        </Link>
                    </div>

                    <div className="flex items-center space-x-10 ml-28">
                        <a
                            href="#"
                            className="font-sans text-white"
                        >
                            About Us
                        </a>

                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-5 py-2 font-sans text-base leading-7 transition-all duration-200 border-2 rounded-full text-white hover:bg-white hover:text-black"
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </header>

            <div className="absolute inset-0">
                <img className="object-cover w-full h-full" src={bg} alt="" />
            </div>

            <div className="relative">
                <div className="px-6 mx-auto max-w-7xl">
                    <div className="w-2/3">
                        <h1 className="font-sans text-base font-normal tracking-tight text-white text-opacity-70">
                            Get the best offers for your credit cards, all in one place.
                        </h1>
                        <p className="mt-6 tracking-tighter text-white">
                            <span className="font-sans font-normal text-8xl">OfferSense</span>
                        </p>
                        <p className="mt-12 font-sans text-base font-normal leading-7 text-white text-opacity-70">
                            Spend Smart. Save Big.
                        </p>
                        <p className="mt-8 font-sans text-xl font-normal text-white">
                            Starting at lots of savings per month
                        </p>

                        <div className="flex items-center mt-5 space-x-3">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-5 py-2 font-sans text-base font-semibold transition-all duration-200 bg-transparent border-2 rounded-full text-white border-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:text-black focus:ring-offset-secondary"
                                role="button"
                            >
                                <FaGift className="w-6 h-6 mr-2" />
                                Get Offers
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;