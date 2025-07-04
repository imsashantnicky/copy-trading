import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tradingService } from '../services/tradingService';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';

const TradingPanel: React.FC = () => {
  const { user } = useAuth();
  const [orderForm, setOrderForm] = useState({
    instrument_key: '',
    trading_symbol: '',
    quantity: '',
    price: '',
    order_type: 'LIMIT',
    transaction_type: 'BUY',
    product: 'D'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderForm.trading_symbol || !orderForm.quantity || !orderForm.price) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await tradingService.placeOrder({
        ...orderForm,
        quantity: parseInt(orderForm.quantity),
        price: parseFloat(orderForm.price)
      });

      // Reset form
      setOrderForm({
        instrument_key: '',
        trading_symbol: '',
        quantity: '',
        price: '',
        order_type: 'LIMIT',
        transaction_type: 'BUY',
        product: 'D'
      });

      setMessage({ type: 'success', text: 'Order placed successfully!' });
    } catch (error) {
      console.error('Order placement failed:', error);
      setMessage({ type: 'error', text: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value
    });
  };

  const handleTransactionTypeChange = (type: 'BUY' | 'SELL') => {
    setOrderForm({
      ...orderForm,
      transaction_type: type
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Trading Panel</h2>
        {user?.role === 'parent' && (
          <div className="flex items-center space-x-2 text-green-400">
            <Target className="h-5 w-5" />
            <span className="text-sm">Copy Trading Active</span>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-900 bg-opacity-50 text-green-300 border border-green-700' 
            : 'bg-red-900 bg-opacity-50 text-red-300 border border-red-700'
        }`}>
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trading Symbol *
          </label>
          <input
            type="text"
            name="trading_symbol"
            value={orderForm.trading_symbol}
            onChange={handleInputChange}
            placeholder="e.g., RELIANCE, TCS, INFY"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={orderForm.quantity}
              onChange={handleInputChange}
              placeholder="0"
              min="1"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={orderForm.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.05"
              min="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order Type
            </label>
            <select
              name="order_type"
              value={orderForm.order_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="LIMIT">Limit</option>
              <option value="MARKET">Market</option>
              <option value="SL">Stop Loss</option>
              <option value="SL-M">Stop Loss Market</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product
            </label>
            <select
              name="product"
              value={orderForm.product}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="D">Delivery</option>
              <option value="I">Intraday</option>
              <option value="CO">Cover Order</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            onClick={() => handleTransactionTypeChange('BUY')}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="h-5 w-5" />
            <span>{isSubmitting && orderForm.transaction_type === 'BUY' ? 'Placing...' : 'BUY'}</span>
          </button>

          <button
            type="submit"
            onClick={() => handleTransactionTypeChange('SELL')}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingDown className="h-5 w-5" />
            <span>{isSubmitting && orderForm.transaction_type === 'SELL' ? 'Placing...' : 'SELL'}</span>
          </button>
        </div>
      </form>

      {user?.role === 'parent' && (
        <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
          <div className="flex items-center space-x-2 text-blue-300">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">
              This trade will be automatically copied to all connected child accounts
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingPanel;