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

// Handle API errors and token expiration
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    console.error('❌ API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Check for token expiration
    if (error.response?.status === 401 || 
        error.response?.data?.code === 'TOKEN_EXPIRED' ||
        error.response?.data?.errors?.[0]?.errorCode === 'UDAPI100050') {
      
      // Clear invalid token
      localStorage.removeItem('upstox_token');
      localStorage.removeItem('user_data');
      
      // Redirect to login
      window.location.href = '/login';
      
      throw new Error('Session expired. Please login again.');
    }
  }
  throw error;
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
      handleApiError(error);
      return [];
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
      handleApiError(error);
      return [];
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
      handleApiError(error);
      return [];
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

      // Validate required fields
      if (!orderData.trading_symbol || !orderData.quantity || !orderData.order_type || !orderData.transaction_type || !orderData.product) {
        throw new Error('Missing required fields: trading_symbol, quantity, order_type, transaction_type, product');
      }

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
        slice: orderData.slice !== false // Default to true
      };

      console.log('📤 Sending order data:', upstoxOrderData);

      const response = await axios.post(`${API_URL}/trading/orders`, upstoxOrderData, {
        headers: getAuthHeaders()
      });

      console.log('✅ Order placed successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error);
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
      handleApiError(error);
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
      handleApiError(error);
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
      handleApiError(error);
      return { portfolio: { total_value: 0, day_pnl: 0, total_pnl: 0 } };
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
      handleApiError(error);
      return [];
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
      handleApiError(error);
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
      handleApiError(error);
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
      // Don't throw error for subscription failures
      return null;
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
      // Return mock data for market data failures
      return {
        data: {
          instrument_key: instrumentToken,
          last_price: 2500 + Math.random() * 100,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Token validation
  validateToken: async () => {
    try {
      console.log('🔍 Validating access token...');

      const response = await axios.post(`${API_URL}/trading/refresh-token`, {}, {
        headers: getAuthHeaders()
      });

      console.log('✅ Token validation successful:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};