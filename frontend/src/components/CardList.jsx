import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCreditCard, FaPlus } from 'react-icons/fa';

const CardList = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    // Load cards from localStorage
    const savedCards = JSON.parse(localStorage.getItem('cards') || '[]');
    setCards(savedCards);
  }, []);

  const getCardBgColor = (cardType) => {
    switch (cardType) {
      case 'VISA':
        return 'from-gray-700 to-gray-900';
      case 'MASTERCARD':
        return 'from-gray-800 to-black';
      case 'RUPAY':
        return 'from-gray-600 to-gray-800';
      default:
        return 'from-gray-700 to-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Your Cards</h2>
          <Link
            to="/add-card"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
          >
            <FaPlus /> Add New Card
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className={`bg-gradient-to-br ${getCardBgColor(card.cardType)} rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300`}
            >
              <div className="flex justify-between items-center mb-8">
                <FaCreditCard className="text-4xl text-white/80" />
                <span className="text-xl font-bold">{card.cardType}</span>
              </div>
              <div className="space-y-4">
                <p className="text-2xl font-mono tracking-wider">
                  {card.cardNumber}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-300">Card Holder</p>
                    <p className="font-semibold">{card.cardName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Expires</p>
                    <p className="font-semibold">{card.expiryDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {cards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cards added yet.</p>
            <Link
              to="/add-card"
              className="inline-block mt-4 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              Add Your First Card
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList; 