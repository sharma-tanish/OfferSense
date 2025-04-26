import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        console.log('Fetching offers for card:', card);
        const response = await fetch('/api/offers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': phoneNumber
          },
          body: JSON.stringify({ cards: [card] })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }

        const data = await response.json();
        console.log('Offers response:', data);
        
        if (data.success) {
          setOffers(data.offers[0].offers);
        } else {
          throw new Error(data.error || 'Failed to fetch offers');
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{offer.title}</h3>
                    <p className="text-gray-400 mb-4">{offer.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Valid till: {new Date(offer.validTill).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Min. spend: ₹{offer.minSpend}
                      </p>
                      <p className="text-sm text-gray-400">
                        Max. cashback: ₹{offer.maxCashback}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers; 