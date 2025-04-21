import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaGift, FaShoppingBag, FaTag, FaCalendarAlt } from 'react-icons/fa';
import { getOffersForCards } from '../services/offersService';

const MyCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGettingOffers, setIsGettingOffers] = useState(false);
  const [cardOffers, setCardOffers] = useState({});

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const savedCards = JSON.parse(localStorage.getItem('cards') || '[]');
      setCards(savedCards);
    } catch (err) {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = (cardId) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    localStorage.setItem('cards', JSON.stringify(updatedCards));
    setCards(updatedCards);
    // Remove offers for deleted card
    const updatedOffers = { ...cardOffers };
    delete updatedOffers[cardId];
    setCardOffers(updatedOffers);
  };

  const handleGetOffers = async () => {
    if (cards.length === 0) {
      setError('No cards available to get offers');
      return;
    }

    setIsGettingOffers(true);
    setError('');
    try {
      const offersData = await getOffersForCards(cards);
      // Group offers by card
      const groupedOffers = {};
      cards.forEach(card => {
        groupedOffers[card.id] = offersData.offers.filter(offer => 
          offer.cardType === card.cardType && offer.bankName === card.bankName
        );
      });
      setCardOffers(groupedOffers);
    } catch (err) {
      setError('Failed to get offers. Please try again later.');
    } finally {
      setIsGettingOffers(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Cards & Offers</h2>
          <div className="flex gap-4">
            <button
              onClick={handleGetOffers}
              disabled={isGettingOffers || cards.length === 0}
              className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGift />
              {isGettingOffers ? 'Getting Offers...' : 'Get Offers for All Cards'}
            </button>
            <button
              onClick={() => navigate('/add-card')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Add New Card
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No cards added yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {cards.map(card => (
              <div key={card.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Card Details Section */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{card.cardType}</h3>
                      <p className="text-sm text-gray-600">{card.bankName}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-500 hover:text-red-700 transition duration-300"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-800">
                      •••• •••• •••• {card.cardNumber.slice(-4)}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>
                      <p>Card Holder</p>
                      <p className="font-medium text-gray-800">{card.cardHolderName}</p>
                    </div>
                    <div>
                      <p>Expires</p>
                      <p className="font-medium text-gray-800">{card.expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Offers Section */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaGift className="text-yellow-500" />
                    Available Offers
                  </h4>
                  
                  {cardOffers[card.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cardOffers[card.id].map((offer, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition duration-300">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-gray-800">{offer.title}</h5>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <FaTag className="text-xs" />
                              {offer.discount}% OFF
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt />
                              <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                            </div>
                            <button
                              onClick={() => window.open(offer.link, '_blank')}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <FaShoppingBag className="text-xs" />
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        {isGettingOffers ? 'Loading offers...' : 'No offers available for this card'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCards; 