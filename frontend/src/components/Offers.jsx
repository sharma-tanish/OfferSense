import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Offers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const offers = location.state?.offers || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      <div className="px-6 py-24 mx-auto max-w-7xl sm:py-32 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Available Offers
          </h2>
          <button
            onClick={() => navigate('/my-cards')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Cards
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((cardOffers, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-xl border border-gray-700">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">{cardOffers.bankName}</h3>
                <p className="text-gray-400">{cardOffers.cardType}</p>
              </div>
              
              <div className="space-y-4">
                {cardOffers.offers.map((offer, offerIndex) => (
                  <div key={offerIndex} className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">{offer.title}</h4>
                    <p className="text-gray-300 mb-2">{offer.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Min. Spend</p>
                        <p className="text-white">₹{offer.minSpend}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Max. Cashback</p>
                        <p className="text-white">₹{offer.maxCashback}</p>
                      </div>
                    </div>
                    <p className="text-green-400 text-sm mt-2">
                      Valid till: {new Date(offer.validTill).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No offers available at the moment.</p>
            <button
              onClick={() => navigate('/my-cards')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Cards
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers; 