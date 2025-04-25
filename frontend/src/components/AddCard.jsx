import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock, FaBuilding } from 'react-icons/fa';

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

  const banks = [
    'SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB', 'BOB', 'CITI', 'KOTAK', 'YES', 'IDFC'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      
      // Only detect network after 6 digits
      if (value.replace(/\s/g, '').length >= 6) {
        const firstDigit = value.charAt(0);
        if (firstDigit === '4') {
          setCardNetwork('VISA');
        } else if (firstDigit === '5') {
          setCardNetwork('MASTERCARD');
        } else if (firstDigit === '6') {
          setCardNetwork('RUPAY');
        } else {
          setCardNetwork('UNKNOWN');
        }
      } else {
        setCardNetwork('');
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
    } else if (cardData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!cardData.cardHolderName) {
      newErrors.cardHolderName = 'Cardholder name is required';
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

    if (!cardData.bankName) {
      newErrors.bankName = 'Bank name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const phoneNumber = localStorage.getItem('phoneNumber');
        if (!phoneNumber) {
          setErrors({ general: 'User not authenticated. Please login again.' });
          return;
        }

        const response = await fetch('http://localhost:5000/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-phone-number': phoneNumber,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            cardName: cardData.cardHolderName,
            expiryDate: cardData.expiryDate,
            cardType: cardNetwork,
            bankName: cardData.bankName
          })
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to add card');
        }

        navigate('/my-cards');
      } catch (error) {
        setErrors({ general: error.message });
        console.error('Error adding card:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Card</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
            )}
            {cardNetwork && (
              <p className="text-sm text-gray-400 mt-1">
                Card Network: {cardNetwork}
              </p>
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
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.cardHolderName && (
              <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>
            )}
          </div>

          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            <select
              name="bankName"
              value={cardData.bankName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Bank</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.bankName && (
              <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
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
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={5}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
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
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCard; 