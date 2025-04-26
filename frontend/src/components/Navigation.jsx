import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaCreditCard, FaSignOutAlt } from 'react-icons/fa';

const Navigation = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('phoneNumber');

  const handleLogout = () => {
    localStorage.removeItem('phoneNumber');
    navigate('/login');
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <FaHome className="mr-2" />
              Home
            </Link>
            <Link
              to="/my-cards"
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <FaCreditCard className="mr-2" />
              My Cards
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 