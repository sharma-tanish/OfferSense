import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaGift, FaShoppingBag, FaTag, FaCalendarAlt } from 'react-icons/fa';
import { getOffersForCards } from '../services/offersService';
import { getCards, deleteCard } from '../services/cardService';

const MyCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGettingOffers, setIsGettingOffers] = useState(false);
  const [cardOffers, setCardOffers] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const savedCards = await getCards();
      setCards(savedCards);
    } catch (err) {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteCard(cardId);
      setCards(cards.filter(card => card._id !== cardId));
      // Remove offers for deleted card
      const updatedOffers = { ...cardOffers };
      delete updatedOffers[cardId];
      setCardOffers(updatedOffers);
    } catch (err) {
      setError('Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
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
        groupedOffers[card._id] = offersData.offers.filter(offer => 
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Cards & Offers</h2>
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Add New Card
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No cards added yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {cards.map(card => (
              <div key={card._id} className="bg-white/5 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/10">
                {/* Card Details Section */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{card.cardType}</h3>
                      <p className="text-sm text-gray-400">{card.bankName}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card._id)}
                      disabled={isDeleting}
                      className="text-red-400 hover:text-red-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-white">
                      •••• •••• •••• {card.cardNumber.slice(-4)}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <div>
                      <p>Card Holder</p>
                      <p className="font-medium text-white">{card.cardHolderName}</p>
                    </div>
                    <div>
                      <p>Expires</p>
                      <p className="font-medium text-white">{card.expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Offers Section */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaGift className="text-yellow-500" />
                    Available Offers
                  </h4>
                  
                  {cardOffers[card._id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cardOffers[card._id].map((offer, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition duration-300">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-white">{offer.title}</h5>
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <FaTag className="text-xs" />
                              {offer.discount}% OFF
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{offer.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt />
                              <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                            </div>
                            <button
                              onClick={() => window.open(offer.link, '_blank')}
                              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                              <FaShoppingBag className="text-xs" />
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-400">
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