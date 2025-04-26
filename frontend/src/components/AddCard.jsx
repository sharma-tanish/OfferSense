import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const AddCard = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    bankName: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState('');
  const [showCvv, setShowCvv] = useState(false);

  const bankOptions = [
    'HDFC BANK',
    'SBI',
    'ICICI BANK',
    'AXIS BANK',
    'KOTAK MAHINDRA BANK',
    'YES BANK',
    'IDFC FIRST BANK',
    'INDUSIND BANK',
    'PUNJAB NATIONAL BANK',
    'BANK OF BARODA'
  ];

  // BIN ranges for different card networks
  const binRanges = {
    VISA: [
      { start: '400000', end: '499999' },
      { start: '400000000000', end: '499999999999' }
    ],
    MASTERCARD: [
      { start: '510000', end: '559999' },
      { start: '222100', end: '272099' },
      { start: '510000000000', end: '559999999999' },
      { start: '222100000000', end: '272099999999' }
    ],
    RUPAY: [
      { start: '60', end: '60' },
      { start: '6521', end: '6522' },
      { start: '6528', end: '6529' },
      { start: '81', end: '81' },
      { start: '82', end: '82' },
      { start: '508', end: '508' },
      { start: '353', end: '353' },
      { start: '356', end: '356' },
      { start: '600000', end: '609999' },
      { start: '652100', end: '652299' },
      { start: '652800', end: '652999' },
      { start: '810000', end: '819999' },
      { start: '820000', end: '829999' },
      { start: '508000', end: '508999' },
      { start: '353000', end: '353999' },
      { start: '356000', end: '356999' }
    ]
  };

  useEffect(() => {
    // Check if user is authenticated
    const authenticatedUser = localStorage.getItem('authenticatedUser');
    if (!authenticatedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const detectCardType = (cardNumber) => {
    // Remove any non-digit characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Get the first 6 digits (BIN)
    const bin = cleanNumber.slice(0, 6);
    
    // Check each card network's BIN ranges
    for (const [network, ranges] of Object.entries(binRanges)) {
      for (const range of ranges) {
        const start = range.start.padEnd(6, '0');
        const end = range.end.padEnd(6, '9');
        if (bin >= start && bin <= end) {
          return network;
        }
      }
    }
    
    return '';
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardData({...cardData, cardNumber: value});
    setCardType(detectCardType(value));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardData({...cardData, cvv: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (cardData.cardNumber.length !== 16) {
      setError('Please enter a valid 16-digit card number');
      setLoading(false);
      return;
    }

    if (cardData.cvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV');
      setLoading(false);
      return;
    }

    if (!cardType) {
      setError('Could not detect card type. Please check your card number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/cards/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': localStorage.getItem('phoneNumber')
        },
        body: JSON.stringify({
          cardNumber: cardData.cardNumber,
          cardType: cardType,
          bankName: cardData.bankName,
          cardName: cardData.cardName,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add card');
      }

      const data = await response.json();
      console.log('Add card response:', data); // Debug log
      
      if (data.success) {
        navigate('/my-cards');
      } else {
        throw new Error(data.error || 'Failed to add card');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Add New Card</h1>
          <button
            onClick={() => navigate('/my-cards')}
            className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-150"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Cards
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">Card Number</label>
            <input
              type="text"
              value={cardData.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              required
            />
            {cardType && (
              <p className="mt-1 text-sm text-indigo-400">Detected: {cardType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Bank Name</label>
            <select
              value={cardData.bankName}
              onChange={(e) => setCardData({...cardData, bankName: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              required
            >
              <option value="">Select Bank</option>
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
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

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-200">CVV</label>
              <div className="relative">
                <input
                  type={showCvv ? "text" : "password"}
                  value={cardData.cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  maxLength={3}
                  className="mt-1 block w-full rounded-lg bg-gray-700/50 border border-gray-600 text-white px-4 py-2 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(!showCvv)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCvv ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Card'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-cards')}
              className="flex-1 flex justify-center py-3 px-4 border border-gray-600 rounded-lg text-sm font-medium text-white hover:bg-gray-700 transition-all duration-300 ease-in-out"
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