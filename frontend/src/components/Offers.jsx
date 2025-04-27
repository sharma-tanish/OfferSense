import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

const Offers = () => {
  const [offers, setOffers] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [hotelOffers, setHotelOffers] = useState('');
  const [flightOffers, setFlightOffers] = useState('');
  const [tourOffers, setTourOffers] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { card } = location.state || {};
  const phoneNumber = localStorage.getItem('phoneNumber');
  const isVerified = localStorage.getItem('isVerified') === 'true';

  useEffect(() => {
    if (!isVerified) {
      navigate('/');
      return;
    }

    if (!card) {
      navigate('/my-cards');
      return;
    }

    const fetchOffers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/offers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': phoneNumber
          },
          body: JSON.stringify({ cardId: card._id })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch offers from backend');
        }
        const data = await response.json();
        if (data.success && data.offers) {
          setCurrentDateTime(data.currentDateTime || '');
          // Parse offers string into 3 categories
          const hotel = data.offers.match(/Hotel Offers[\s\S]*?(?=\n\d+\.|Flight Offers|Tour Offers|$)/i);
          const flight = data.offers.match(/Flight Offers[\s\S]*?(?=\n\d+\.|Hotel Offers|Tour Offers|$)/i);
          const tour = data.offers.match(/Tour Offers[\s\S]*?(?=\n\d+\.|Hotel Offers|Flight Offers|$)/i);
          setHotelOffers(hotel ? hotel[0].trim() : 'No hotel offers found.');
          setFlightOffers(flight ? flight[0].trim() : 'No flight offers found.');
          setTourOffers(tour ? tour[0].trim() : 'No tour offers found.');
        } else {
          throw new Error(data.error || 'No offers found');
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError(err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [navigate, phoneNumber, isVerified, card]);

  const handleLogout = () => {
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('isVerified');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/my-cards')}
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
                <FaArrowLeft className="mr-2" />
                Back to Cards
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
                <FaHome className="mr-2" />
                Home
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-indigo-400">{card.bankName}</h2>
              <p className="text-gray-400">{card.cardType} •••• {card.lastFourDigits}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-indigo-300 mb-2">Curated Offers</h3>
              <p className="text-gray-400">Current Date and Time: {currentDateTime}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mt-8">
              {/* Hotel Offers Pane */}
              <div className="flex-1 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-xl p-6 min-h-[300px] border-2 border-blue-400/30">
                <h4 className="text-xl font-bold text-blue-200 mb-4 text-center">🏨 Hotel Offers</h4>
                <pre className="whitespace-pre-wrap text-blue-100 font-mono text-sm">{hotelOffers}</pre>
              </div>
              {/* Flight Offers Pane */}
              <div className="flex-1 bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl shadow-xl p-6 min-h-[300px] border-2 border-purple-400/30">
                <h4 className="text-xl font-bold text-purple-200 mb-4 text-center">✈️ Flight Offers</h4>
                <pre className="whitespace-pre-wrap text-purple-100 font-mono text-sm">{flightOffers}</pre>
              </div>
              {/* Tour Offers Pane */}
              <div className="flex-1 bg-gradient-to-br from-pink-900 to-pink-700 rounded-2xl shadow-xl p-6 min-h-[300px] border-2 border-pink-400/30">
                <h4 className="text-xl font-bold text-pink-200 mb-4 text-center">🗺️ Tour Offers</h4>
                <pre className="whitespace-pre-wrap text-pink-100 font-mono text-sm">{tourOffers}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;