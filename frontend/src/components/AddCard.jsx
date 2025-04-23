import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock, FaBuilding } from 'react-icons/fa';
import { detectCardNetwork, validateCardNumber, formatCardNumber } from '../utils/cardUtils';
import { addCard } from '../services/cardService';

const BANKS = [
  { name: 'State Bank of India', code: 'SBI' },
  { name: 'HDFC Bank', code: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICICI' },
  { name: 'Axis Bank', code: 'AXIS' },
  { name: 'Punjab National Bank', code: 'PNB' },
  { name: 'Bank of Baroda', code: 'BOB' },
  { name: 'Citibank', code: 'CITI' },
  { name: 'Kotak Mahindra Bank', code: 'KOTAK' },
  { name: 'Yes Bank', code: 'YES' },
  { name: 'IDFC First Bank', code: 'IDFC' },
  { name: 'Other Bank', code: 'OTHER' }
];

const AddCard = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    bankName: ''
  });
  const [errors, setErrors] = useState({});
  const [cardNetwork, setCardNetwork] = useState('');
  const [showNetwork, setShowNetwork] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      // Detect network after 6 digits
      if (value.replace(/\s/g, '').length >= 6) {
        const network = detectCardNetwork(value);
        setCardNetwork(network);
        setShowNetwork(true);
      } else {
        setShowNetwork(false);
      }
    } else if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})/, '$1/')
        .substr(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substr(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!cardData.cardHolderName) {
      newErrors.cardHolderName = 'Cardholder name is required';
    } else if (cardData.cardHolderName.length < 3) {
      newErrors.cardHolderName = 'Name must be at least 3 characters';
    }
    
    if (!cardData.bankName) {
      newErrors.bankName = 'Bank name is required';
    }
    
    if (!cardData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = cardData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    if (!cardData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setErrors({ submit: 'Please login to add a card' });
      navigate('/login');
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const newCard = {
          cardNumber: cardData.cardNumber,
          cardHolderName: cardData.cardHolderName,
          expiryDate: cardData.expiryDate,
          cardType: cardNetwork,
          bankName: cardData.bankName
        };
        
        await addCard(newCard);
        navigate('/my-cards');
      } catch (error) {
        console.error('Add card error:', error);
        if (error.message.includes('Unauthorized')) {
          setErrors({ submit: 'Session expired. Please login again.' });
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        } else {
          setErrors({ submit: error.message || 'Failed to add card' });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Add New Card</h2>
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
            )}
            {showNetwork && cardNetwork && (
              <p className="text-sm text-gray-400 mt-1">
                Card Network: {cardNetwork}
              </p>
            )}
          </div>

          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            <select
              name="bankName"
              value={cardData.bankName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            >
              <option value="">Select Bank</option>
              {BANKS.map(bank => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
            {errors.bankName && (
              <p className="text-red-400 text-sm mt-1">{errors.bankName}</p>
            )}
          </div>

          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="cardHolderName"
              value={cardData.cardHolderName}
              onChange={handleChange}
              placeholder="Cardholder Name"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            />
            {errors.cardHolderName && (
              <p className="text-red-400 text-sm mt-1">{errors.cardHolderName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="expiryDate"
                value={cardData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                maxLength={5}
              />
              {errors.expiryDate && (
                <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="cvv"
                value={cardData.cvv}
                onChange={handleChange}
                placeholder="CVV"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding Card...' : 'Add Card'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-cards')}
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCard; 