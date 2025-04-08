import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaPlus, FaTrash, FaGift } from 'react-icons/fa';
import api from '../utils/api';

const MyCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const authenticatedUser = localStorage.getItem('authenticatedUser');
    if (!authenticatedUser) {
      navigate('/login');
    } else {
      fetchCards();
    }
  }, [navigate]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/cards');
      setCards(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      setError('');
      await api.delete(`/cards/${cardId}`);
      setCards(cards.filter(card => card.id !== cardId));
    } catch (err) {
      setError(err.message || 'Failed to delete card');
    }
  };

  const handleGetOffers = (card) => {
    alert(`Getting offers for ${card.cardType} card ending in ${card.lastFourDigits}`);
  };

  const getCardBgColor = (cardType) => {
    switch (cardType) {
      case 'VISA':
        return 'from-blue-700 to-blue-900';
      case 'MASTERCARD':
        return 'from-red-700 to-red-900';
      case 'RUPAY':
        return 'from-green-700 to-green-900';
      default:
        return 'from-gray-700 to-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 flex justify-between items-center">
          <div className="text-white">
            <span className="text-gray-400">Welcome,</span>
            <span className="ml-2 font-semibold">{userPhone}</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/add-card"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              <FaPlus className="mr-2" /> Add New Card
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('authenticatedUser');
                navigate('/login');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <h2 className="text-3xl font-bold text-white mb-8">My Cards</h2>

        {cards.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl backdrop-blur-sm">
            <p className="text-gray-400 text-lg mb-4">No cards added yet</p>
            <Link
              to="/add-card"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              <FaPlus className="mr-2" /> Add Your First Card
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col"
              >
                <div
                  className={`bg-gradient-to-br ${getCardBgColor(
                    card.cardType
                  )} rounded-t-xl p-6 text-white shadow-xl relative group`}
                >
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="absolute top-2 right-2 p-2 text-white/60 hover:text-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Card"
                  >
                    <FaTrash />
                  </button>
                  <div className="flex justify-between items-center mb-4">
                    <FaCreditCard className="text-4xl opacity-80" />
                    <span className="text-xl font-bold">{card.cardType}</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-mono tracking-wider">
                      •••• •••• •••• {card.lastFourDigits}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm opacity-80">Card Holder</p>
                        <p className="font-semibold">{card.cardHolderName}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-80">Expires</p>
                        <p className="font-semibold">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleGetOffers(card)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-b-xl transition-all duration-300 backdrop-blur-sm border-t border-white/10"
                >
                  <FaGift className="text-yellow-500" />
                  <span>Get Offers</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCards; 