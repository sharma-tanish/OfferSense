import { useState } from 'react';

const AddCard = () => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardType: 'VISA',
    cardName: '',
    expiryDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cardData)
      });
      
      if (response.ok) {
        alert('Card added successfully!');
        setCardData({ cardNumber: '', cardType: 'VISA', cardName: '', expiryDate: '' });
      }
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Add New Card</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200">Card Number</label>
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Card Type</label>
            <select
              value={cardData.cardType}
              onChange={(e) => setCardData({...cardData, cardType: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Expiry Date</label>
            <input
              type="month"
              value={cardData.expiryDate}
              onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCard; 