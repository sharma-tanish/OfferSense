import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCard = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardType: 'VISA',
    cardName: '',
    expiryDate: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cardData.cardNumber.length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return;
    }

    const newCard = {
      id: Date.now(),
      ...cardData,
      cardNumber: cardData.cardNumber.replace(/(\d{4})/g, '$1 ').trim()
    };

    const existingCards = JSON.parse(localStorage.getItem('cards') || '[]');
    localStorage.setItem('cards', JSON.stringify([...existingCards, newCard]));

    alert('Card added successfully!');
    navigate('/my-cards');
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardData({ ...cardData, cardNumber: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Add New Card</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200">Card Number</label>
            <input
              type="text"
              value={cardData.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Card Type</label>
            <select
              value={cardData.cardType}
              onChange={(e) => setCardData({...cardData, cardType: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              required
            >
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">MasterCard</option>
              <option value="RUPAY">RuPay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Card Holder Name</label>
            <input
              type="text"
              value={cardData.cardName}
              onChange={(e) => setCardData({...cardData, cardName: e.target.value.toUpperCase()})}
              placeholder="JOHN DOE"
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Expiry Date</label>
            <input
              type="month"
              value={cardData.expiryDate}
              onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out"
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCard; 