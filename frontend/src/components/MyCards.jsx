import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPlus, FaGift, FaCreditCard, FaTrash } from 'react-icons/fa';
import Navbar from './Navbar';
import cardService from '../services/cardService';
import { getOffersForCards } from '../services/offersService';

const MyCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGettingOffers, setIsGettingOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await cardService.getCards();
      setCards(cards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('Failed to load cards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await cardService.deleteCard(cardId);
      setCards(cards.filter(card => card._id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
      setError('Failed to delete card. Please try again.');
    }
  };

  const handleRefresh = () => {
    fetchCards();
  };

  const handleGetOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOffersForCards(cards);
      if (response.success) {
        setOffers(response.offers);
        navigate('/offers', { 
          state: { offers: response.offers },
          replace: true 
        });
      } else {
        throw new Error(response.error || 'Failed to get offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchCards}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      <div className="px-6 py-24 mx-auto max-w-7xl sm:py-32 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Cards
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleGetOffers}
              disabled={loading || cards.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Get Offers'}
            </button>
            <Link
              to="/add-card"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 border-2 rounded-full hover:bg-white hover:text-black"
            >
              <FaPlus />
              Add Card
            </Link>
          </div>
        </div>

        {offers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">Available Offers</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <h4 className="text-lg font-semibold text-white">{offer.title}</h4>
                  <p className="text-gray-400 mt-2">{offer.description}</p>
                  <p className="text-green-400 mt-2">Valid until: {offer.validUntil}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card._id}
              className="relative p-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex items-center gap-4">
                <button
                  onClick={() => handleDeleteCard(card._id)}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-full hover:bg-gray-700"
                  title="Delete Card"
                >
                  <FaTrash />
                </button>
                <FaCreditCard className="text-gray-600 text-3xl" />
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">
                      {card.cardType || 'Unknown Card Type'}
                    </h3>
                    <p className="text-sm text-gray-400">{card.bankName || 'Unknown Bank'}</p>
                  </div>
                  <span className="text-lg text-gray-400 font-mono">
                    •••• •••• •••• {card.lastFourDigits || card.cardNumber?.slice(-4) || '0000'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Card Holder</p>
                    <p className="text-lg text-white font-medium">{card.cardHolderName || 'Unknown Holder'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Expiry Date</p>
                    <p className="text-lg text-white font-medium">{card.expiryDate || 'MM/YY'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cards added yet. Click the "Add Card" button to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCards; 