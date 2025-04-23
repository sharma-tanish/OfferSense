import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTrash, FaGift, FaShoppingBag, FaTag, FaCalendarAlt, 
  FaPlane, FaFilm, FaUtensils, FaGasPump, FaFilter,
  FaStar, FaCrown
} from 'react-icons/fa';
import { getOffersForCards } from '../services/offersService';
import { getCards, deleteCard } from '../services/cardService';

const CATEGORIES = ['ALL', 'TRAVEL', 'ENTERTAINMENT', 'SHOPPING', 'DINING', 'FUEL'];

const CATEGORY_ICONS = {
  TRAVEL: <FaPlane className="text-blue-500" />,
  ENTERTAINMENT: <FaFilm className="text-purple-500" />,
  SHOPPING: <FaShoppingBag className="text-green-500" />,
  DINING: <FaUtensils className="text-red-500" />,
  FUEL: <FaGasPump className="text-yellow-500" />
};

const CATEGORY_COLORS = {
  TRAVEL: 'from-blue-900 to-blue-800',
  ENTERTAINMENT: 'from-purple-900 to-purple-800',
  SHOPPING: 'from-green-900 to-green-800',
  DINING: 'from-red-900 to-red-800',
  FUEL: 'from-yellow-900 to-yellow-800'
};

const MyCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGettingOffers, setIsGettingOffers] = useState(false);
  const [cardOffers, setCardOffers] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [bestOffers, setBestOffers] = useState({});

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
      
      // Group offers by card and category
      const groupedOffers = {};
      const allOffers = [];
      
      cards.forEach(card => {
        groupedOffers[card._id] = {};
        offersData.offers.forEach(offer => {
          if (offer.cardId === card._id) {
            if (!groupedOffers[card._id][offer.category]) {
              groupedOffers[card._id][offer.category] = [];
            }
            groupedOffers[card._id][offer.category].push(offer);
            allOffers.push(offer);
          }
        });
      });

      setCardOffers(groupedOffers);
      setBestOffers(findBestOffers(allOffers));
    } catch (err) {
      setError('Failed to get offers. Please try again later.');
    } finally {
      setIsGettingOffers(false);
    }
  };

  const findBestOffers = (offers) => {
    const bestByCategory = {};
    
    // Group offers by category
    const offersByCategory = {};
    offers.forEach(offer => {
      if (!offersByCategory[offer.category]) {
        offersByCategory[offer.category] = [];
      }
      offersByCategory[offer.category].push(offer);
    });

    // Find best offer in each category
    Object.entries(offersByCategory).forEach(([category, categoryOffers]) => {
      bestByCategory[category] = categoryOffers.reduce((best, current) => {
        if (!best || current.discount > best.discount) {
          return current;
        }
        return best;
      }, null);
    });

    return bestByCategory;
  };

  const renderBestOffers = () => (
    <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-6">
        <FaCrown className="text-yellow-500 text-xl" />
        <h3 className="text-xl font-semibold text-white">Best Offers</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(bestOffers).map(([category, offer]) => (
          <div 
            key={category}
            className={`bg-gradient-to-br ${CATEGORY_COLORS[category]} rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition duration-300`}
          >
            <div className="flex items-center gap-2 mb-2">
              {CATEGORY_ICONS[category]}
              <span className="text-sm font-medium text-white capitalize">{category.toLowerCase()}</span>
            </div>
            <h5 className="font-semibold text-white mb-2">{offer.title}</h5>
            <div className="flex items-center justify-between">
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <FaStar className="text-xs" />
                {offer.discount}% OFF
              </span>
              <button
                onClick={() => window.open(offer.link, '_blank')}
                className="text-white hover:text-gray-200 text-xs font-medium flex items-center gap-1"
              >
                <FaShoppingBag className="text-xs" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategoryFilter = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 text-white">
        <FaFilter />
        <span className="font-medium">Filter by:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition duration-300 ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category === 'ALL' ? 'All Categories' : category}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCategoryOffers = (category, offers) => {
    if (selectedCategory !== 'ALL' && selectedCategory !== category) {
      return null;
    }

    if (!offers || !Array.isArray(offers) || offers.length === 0) {
      return null;
    }

    return (
      <div key={category} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {CATEGORY_ICONS[category]}
          <h3 className="text-xl font-semibold text-white capitalize">{category.toLowerCase()}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${CATEGORY_COLORS[category]} rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition duration-300`}
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-white">{offer.title}</h5>
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <FaTag className="text-xs" />
                  {offer.discount}% OFF
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{offer.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <FaCalendarAlt />
                  <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => window.open(offer.link, '_blank')}
                  className="text-white hover:text-gray-200 font-medium flex items-center gap-1"
                >
                  <FaShoppingBag className="text-xs" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
            {Object.keys(bestOffers).length > 0 && renderBestOffers()}
            
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
                      •••• •••• •••• {card.lastFourDigits || '0000'}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <div>
                      <p>Card Holder</p>
                      <p className="font-medium text-white">{card.cardHolderName || 'N/A'}</p>
                    </div>
                    <div>
                      <p>Expires</p>
                      <p className="font-medium text-white">{card.expiryDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Offers Section */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaGift className="text-yellow-500" />
                    Available Offers
                  </h4>
                  
                  {cardOffers[card._id] ? (
                    <>
                      {renderCategoryFilter()}
                      {Object.entries(cardOffers[card._id]).map(([category, offers]) => 
                        renderCategoryOffers(category, offers)
                      )}
                    </>
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