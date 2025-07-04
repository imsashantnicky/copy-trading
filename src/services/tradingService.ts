import axios from 'axios';
import { Order, Position, Trade } from '../types/trading';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('upstox_token');
  return { Authorization: `Bearer ${token}` };
};

export const tradingService = {
  getPositions: async (): Promise<Position[]> => {
    try {
      console.log('📊 Fetching positions...');

      const response = await axios.get(`${API_URL}/trading/positions`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Positions fetched:', response.data);
      return response.data.positions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Positions fetch error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error:', error);
      }
      throw error;
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      console.log('📋 Fetching orders...');

      const response = await axios.get(`${API_URL}/trading/orders`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Orders fetched:', response.data);
      return response.data.orders;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Orders fetch error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error:', error);
      }
      throw error;
    }
  },

  getTrades: async (): Promise<Trade[]> => {
    try {
      console.log('💼 Fetching trades...');

      const response = await axios.get(`${API_URL}/trading/trades`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Trades fetched:', response.data);
      return response.data.trades;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Trades fetch error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error:', error);
      }
      throw error;
    }
  },

  placeOrder: async (orderData: {
    instrument_key: string;
    trading_symbol: string;
    quantity: number;
    price: number;
    order_type: string;
    transaction_type: string;
    product: string;
  }) => {
    try {
      console.log('🚀 Placing order:', orderData);

      const response = await axios.post(`${API_URL}/trading/orders`, orderData, {
        headers: getAuthHeaders()
      });

      console.log('✅ Order placed successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Order placement error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          orderData
        });
      } else {
        console.error('❌ Unexpected error during order placement:', error);
      }
      throw error;
    }
  },

  cancelOrder: async (orderId: string) => {
    try {
      console.log('❌ Cancelling order:', orderId);

      const response = await axios.delete(`${API_URL}/trading/orders/${orderId}`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Order cancelled successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Order cancellation error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          orderId
        });
      } else {
        console.error('❌ Unexpected error during order cancellation:', error);
      }
      throw error;
    }
  },

  getPortfolio: async () => {
    try {
      console.log('💰 Fetching portfolio...');

      const response = await axios.get(`${API_URL}/trading/portfolio`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Portfolio fetched:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Portfolio fetch error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error while fetching portfolio:', error);
      }
      throw error;
    }
  }
};
