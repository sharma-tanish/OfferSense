import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-black/20 backdrop-blur-md fixed w-full z-20 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
            <li>
              <Link
                to="/my-cards"
                className="block py-2 px-3 text-white rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0"
              >
                My Cards
              </Link>
            </li>
            <li>
              <Link
                to="/add-card"
                className="block py-2 px-3 text-white rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0"
              >
                Add Card
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 