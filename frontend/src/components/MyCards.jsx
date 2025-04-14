import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaGift } from 'react-icons/fa';

const MyCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const phoneNumber = localStorage.getItem('phoneNumber');
  const isVerified = localStorage.getItem('isVerified') === 'true';

  useEffect(() => {
    // Check if user is verified
    if (!isVerified) {
      navigate('/');
      return;
    }

    // Fetch cards from backend API
    const fetchCards = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/cards', {
          headers: {
            'Content-Type': 'application/json',
            'user-id': phoneNumber // Send phone number as user identifier
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }

        const data = await response.json();
        if (data.success) {
          setCards(data.cards);
        } else {
          throw new Error(data.message || 'Failed to fetch cards');
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError(err.message || 'Failed to load cards');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [navigate, isVerified, phoneNumber]);

  const handleDeleteCard = async (cardId) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-id': phoneNumber
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      const data = await response.json();
      if (data.success) {
        setCards(cards.filter(card => card.id !== cardId));
      } else {
        throw new Error(data.message || 'Failed to delete card');
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      setError(err.message || 'Failed to delete card');
    }
  };

  const handleGetOffers = (card) => {
    alert(`Getting offers for ${card.cardType} card ending in ${card.lastFourDigits}`);
  };

  const handleAddCard = () => {
    navigate('/add-card');
  };

  const handleLogout = () => {
    localStorage.removeItem('isVerified');
    localStorage.removeItem('phoneNumber');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Welcome</h1>
              {phoneNumber && (
                <span className="ml-2 text-gray-400">+{phoneNumber}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddCard}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
                <FaPlus className="mr-2" />
                Add New Card
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
              <div key={card.id} className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{card.cardType}</h3>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="space-y-2 text-gray-400">
                    <p>**** **** **** {card.lastFourDigits}</p>
                    <p>{card.cardHolderName}</p>
                    <p>Expires: {card.expiryDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGetOffers(card)}
                  className="w-full bg-yellow-500/90 hover:bg-yellow-500 text-white py-3 px-4 flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <FaGift />
                  Get Offers
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">No cards added yet</h3>
            <p className="text-gray-400 mb-6">Add your first card to get started</p>
            <button
              onClick={handleAddCard}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
            >
              <FaPlus className="mr-2" />
              Add Your First Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCards; 