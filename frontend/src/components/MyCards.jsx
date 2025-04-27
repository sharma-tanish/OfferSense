import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaGift, FaHome, FaSignOutAlt } from 'react-icons/fa';

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
      console.log('User not verified, redirecting to home');
      navigate('/');
      return;
    }

    // Fetch cards from backend API
    const fetchCards = async () => {
      setLoading(true);
      try {
        console.log('Starting to fetch cards for user:', phoneNumber);
        const response = await fetch('http://localhost:5000/api/cards', {
          headers: {
            'Content-Type': 'application/json',
            'user-id': phoneNumber
          }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Raw response data:', data);
        
        if (!response.ok) {
          console.error('Response not OK:', response.status, data);
          throw new Error(data.error || data.message || 'Failed to fetch cards');
        }
        
        if (!data.success) {
          console.error('Response not successful:', data);
          throw new Error(data.error || 'Failed to fetch cards');
        }
        
        console.log('Setting cards:', data.cards);
        setCards(data.cards || []);
      } catch (err) {
        console.error('Error in fetchCards:', err);
        setError(err.message || 'Failed to load cards');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [phoneNumber, isVerified, navigate]);

  // Add effect to log cards state changes
  useEffect(() => {
    console.log('Cards state updated:', cards);
  }, [cards]);

  const handleAddCard = () => {
    navigate('/add-card');
  };

  const handleLogout = () => {
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('isVerified');
    navigate('/');
  };

  const handleGetOffers = (card) => {
    console.log('Navigating to offers with card:', card);
    if (!card || !card._id) {
      console.error('Invalid card data:', card);
      return;
    }
    navigate('/offers', { 
      state: { 
        card: {
          _id: card._id,
          cardType: card.cardType,
          bankName: card.bankName,
          lastFourDigits: card.lastFourDigits,
          cardHolderName: card.cardHolderName,
          expiryDate: card.expiryDate
        }
      } 
    });
  };

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
        // Refresh the cards list
        const updatedCards = cards.filter(card => card._id !== cardId);
        setCards(updatedCards);
      } else {
        throw new Error(data.error || 'Failed to delete card');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete card');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
                <FaHome className="mr-2" />
                Home
              </button>
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
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-400">{card.bankName}</h3>
                      <p className="text-sm text-gray-400">{card.cardType}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">**** **** **** {card.lastFourDigits}</p>
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
            <p className="text-gray-400">No cards added yet</p>
            <button
              onClick={handleAddCard}
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
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