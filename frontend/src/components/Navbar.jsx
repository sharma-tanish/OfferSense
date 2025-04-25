import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const isVerified = localStorage.getItem('isVerified') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isVerified');
    localStorage.removeItem('phoneNumber');
    navigate('/');
  };

  return (
    <header className="absolute inset-x-0 top-0 z-10 py-8">
      <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
        <div className="flex flex-shrink-0">
          <Link to="/">
            <img className="w-auto h-8" src={logo} alt="OfferSense" />
          </Link>
        </div>

        <div className="flex items-center space-x-10">
          {isVerified ? (
            <>
              <Link
                to="/my-cards"
                className="font-sans text-white hover:text-gray-300"
              >
                My Cards
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white hover:text-gray-300"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="#"
                className="font-sans text-white hover:text-gray-300"
              >
                About Us
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2 font-sans text-base leading-7 transition-all duration-200 border-2 rounded-full text-white hover:bg-white hover:text-black"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar; 