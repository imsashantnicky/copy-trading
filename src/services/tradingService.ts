import axios from 'axios';
import { Order, Position, Trade, OrderRequest, ChildAccount } from '../types/trading';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('upstox_token');
  return { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
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

  placeOrder: async (orderData: Partial<OrderRequest> & {
    trading_symbol: string;
    quantity: number;
    price: number;
    order_type: string;
    transaction_type: string;
    product: string;
  }) => {
    try {
      console.log('🚀 Placing order:', orderData);

      // Convert to Upstox V3 API format
      const upstoxOrderData: OrderRequest = {
        quantity: orderData.quantity,
        product: orderData.product,
        validity: orderData.validity || 'DAY',
        price: orderData.price,
        tag: orderData.tag || `copy_trading_${Date.now()}`,
        instrument_token: orderData.instrument_token || `NSE_EQ|${orderData.trading_symbol}`,
        order_type: orderData.order_type,
        transaction_type: orderData.transaction_type,
        disclosed_quantity: orderData.disclosed_quantity || 0,
        trigger_price: orderData.trigger_price || 0,
        is_amo: orderData.is_amo || false,
        slice: orderData.slice || true
      };

      const response = await axios.post(`${API_URL}/trading/orders`, upstoxOrderData, {
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

  modifyOrder: async (orderId: string, orderData: Partial<OrderRequest>) => {
    try {
      console.log('🔄 Modifying order:', orderId, orderData);

      const response = await axios.put(`${API_URL}/trading/orders/${orderId}`, orderData, {
        headers: getAuthHeaders()
      });

      console.log('✅ Order modified successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Order modification error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          orderId,
          orderData
        });
      } else {
        console.error('❌ Unexpected error during order modification:', error);
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
  },

  // Child account management
  getChildAccounts: async (): Promise<ChildAccount[]> => {
    try {
      console.log('👥 Fetching child accounts...');

      const response = await axios.get(`${API_URL}/trading/child-accounts`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Child accounts fetched:', response.data);
      return response.data.children;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Child accounts fetch error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error while fetching child accounts:', error);
      }
      throw error;
    }
  },

  addChildAccount: async (childData: { user_id: string; access_token: string }) => {
    try {
      console.log('➕ Adding child account:', childData.user_id);

      const response = await axios.post(`${API_URL}/trading/child-accounts`, childData, {
        headers: getAuthHeaders()
      });

      console.log('✅ Child account added successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Add child account error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error while adding child account:', error);
      }
      throw error;
    }
  },

  removeChildAccount: async (childUserId: string) => {
    try {
      console.log('➖ Removing child account:', childUserId);

      const response = await axios.delete(`${API_URL}/trading/child-accounts/${childUserId}`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Child account removed successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Remove child account error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('❌ Unexpected error while removing child account:', error);
      }
      throw error;
    }
  },

  // Real-time order book
  subscribeToOrderUpdates: async () => {
    try {
      console.log('🔔 Subscribing to order updates...');

      const response = await axios.post(`${API_URL}/trading/subscribe-orders`, {}, {
        headers: getAuthHeaders()
      });

      console.log('✅ Subscribed to order updates:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Order subscription error:', error);
      throw error;
    }
  },

  // Market data
  getMarketData: async (instrumentToken: string) => {
    try {
      console.log('📈 Fetching market data for:', instrumentToken);

      const response = await axios.get(`${API_URL}/trading/market-data/${instrumentToken}`, {
        headers: getAuthHeaders()
      });

      console.log('✅ Market data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Market data fetch error:', error);
      throw error;
    }
  }
};