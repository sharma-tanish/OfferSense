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
      const userId = localStorage.getItem('phoneNumber');
      if (!userId) {
        setError('User not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/cards', {
        headers: {
          'user-id': userId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cards');
      }

      // Transform the cards data to match the frontend structure
      const transformedCards = data.cards.map(card => ({
        id: card.id,
        cardNumber: `•••• •••• •••• ${card.lastFourDigits}`,
        cardHolderName: card.cardHolderName,
        expiryDate: card.expiryDate,
        cardType: card.cardType,
        bankName: card.bankName || 'Unknown Bank'
      }));

      setCards(transformedCards);
    } catch (err) {
      setError('Failed to load cards');
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const userId = localStorage.getItem('phoneNumber');
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }

      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'user-id': userId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      // Remove the card from the local state
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      // Remove offers for deleted card
      const updatedOffers = { ...cardOffers };
      delete updatedOffers[cardId];
      setCardOffers(updatedOffers);
    } catch (err) {
      setError('Failed to delete card');
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
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Add New Card
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
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
              <div key={card.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Card Details Section */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{card.cardType}</h3>
                      <p className="text-sm text-gray-400">{card.bankName}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-500 hover:text-red-400 transition duration-300"
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
                  
                  {cardOffers[card.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cardOffers[card.id].map((offer, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:shadow-md transition duration-300">
                          <h5 className="text-white font-medium mb-2">{offer.title}</h5>
                          <p className="text-gray-300 text-sm">{offer.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-yellow-500 text-sm font-medium">
                              {offer.discount}% OFF
                            </span>
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No offers available for this card</p>
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