import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

const Offers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerData, setOfferData] = useState({
    currentDateTime: '',
    offers: {
      hotel: '',
      flight: '',
      tour: ''
    }
  });
  
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
        console.log('Received offers data:', data);

        if (data.success && data.offers) {
          // Process all offers data at once
          const sections = data.offers.split('###').filter(Boolean);
          const processedOffers = {
            currentDateTime: data.currentDateTime || '',
            offers: {
              hotel: '',
              flight: '',
              tour: ''
            }
          };

          sections.forEach(section => {
            const trimmedSection = section.trim();
            if (trimmedSection.toLowerCase().includes('hotel offers')) {
              processedOffers.offers.hotel = trimmedSection;
            } else if (trimmedSection.toLowerCase().includes('flight offers')) {
              processedOffers.offers.flight = trimmedSection;
            } else if (trimmedSection.toLowerCase().includes('tour offers')) {
              processedOffers.offers.tour = trimmedSection;
            }
          });

          setOfferData(processedOffers);
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

  const formatOffers = (offersText) => {
    if (!offersText) return 'No offers available.';
    
    // Remove the category header
    const withoutHeader = offersText.split('\n').slice(1).join('\n');
    
    return withoutHeader.trim();
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
              <p className="text-gray-400">Current Date and Time: {offerData.currentDateTime}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Hotel Offers Card */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-xl p-6 min-h-[400px] border-2 border-blue-400/30">
                <h4 className="text-xl font-bold text-blue-200 mb-4 flex items-center justify-center">
                  <span className="mr-2">🏨</span> Hotel Offers
                </h4>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-blue-100 text-sm leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: formatOffers(offerData.offers.hotel).replace(/\*\*/g, '') }} />
                </div>
              </div>

              {/* Flight Offers Card */}
              <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl shadow-xl p-6 min-h-[400px] border-2 border-purple-400/30">
                <h4 className="text-xl font-bold text-purple-200 mb-4 flex items-center justify-center">
                  <span className="mr-2">✈️</span> Flight Offers
                </h4>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-purple-100 text-sm leading-relaxed"
                       dangerouslySetInnerHTML={{ __html: formatOffers(offerData.offers.flight).replace(/\*\*/g, '') }} />
                </div>
              </div>

              {/* Tour Offers Card */}
              <div className="bg-gradient-to-br from-pink-900 to-pink-700 rounded-2xl shadow-xl p-6 min-h-[400px] border-2 border-pink-400/30">
                <h4 className="text-xl font-bold text-pink-200 mb-4 flex items-center justify-center">
                  <span className="mr-2">🗺️</span> Tour Offers
                </h4>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-pink-100 text-sm leading-relaxed"
                       dangerouslySetInnerHTML={{ __html: formatOffers(offerData.offers.tour).replace(/\*\*/g, '') }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;