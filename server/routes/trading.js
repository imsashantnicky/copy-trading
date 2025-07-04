import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

// Mock data for demonstration
const mockPositions = [
  {
    instrument_key: 'NSE_EQ|INE002A01018',
    trading_symbol: 'RELIANCE',
    quantity: 10,
    average_price: 2450.50,
    last_price: 2475.25,
    close_price: 2460.00,
    pnl: 247.50,
    day_change: 15.25,
    day_change_percentage: 0.62,
    product: 'D',
    exchange: 'NSE'
  },
  {
    instrument_key: 'NSE_EQ|INE467B01029',
    trading_symbol: 'TCS',
    quantity: 5,
    average_price: 3520.00,
    last_price: 3545.75,
    close_price: 3530.00,
    pnl: 128.75,
    day_change: 15.75,
    day_change_percentage: 0.45,
    product: 'D',
    exchange: 'NSE'
  }
];

const mockOrders = [
  {
    order_id: 'ORDER_001',
    instrument_key: 'NSE_EQ|INE002A01018',
    trading_symbol: 'RELIANCE',
    quantity: 10,
    price: 2450.50,
    order_type: 'LIMIT',
    transaction_type: 'BUY',
    product: 'D',
    status: 'complete',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    filled_quantity: 10,
    pending_quantity: 0,
    average_price: 2450.50
  }
];

const mockTrades = [];

// Upstox API base URL
const UPSTOX_API_BASE = 'https://api.upstox.com/v2';

router.get('/positions', authenticateToken, async (req, res) => {
  try {
    // In production, fetch from Upstox API
    /*
    const response = await axios.get(`${UPSTOX_API_BASE}/portfolio/long-term-holdings`, {
      headers: {
        'Authorization': `Bearer ${req.user.access_token}`
      }
    });
    */

    res.json({ success: true, positions: mockPositions });
  } catch (error) {
    console.error('Positions fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch positions' });
  }
});

router.get('/orders', authenticateToken, async (req, res) => {
  try {
    // In production, fetch from Upstox API
    /*
    const response = await axios.get(`${UPSTOX_API_BASE}/order/retrieve-all`, {
      headers: {
        'Authorization': `Bearer ${req.user.access_token}`
      }
    });
    */

    res.json({ success: true, orders: mockOrders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

router.get('/trades', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, trades: mockTrades });
  } catch (error) {
    console.error('Trades fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trades' });
  }
});

router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { instrument_key, trading_symbol, quantity, price, order_type, transaction_type, product } = req.body;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Validate required fields
    if (!trading_symbol || !quantity || !price || !order_type || !transaction_type || !product) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Create order object
    const order = {
      order_id: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      instrument_key: instrument_key || `NSE_EQ|${trading_symbol}`,
      trading_symbol,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      order_type,
      transaction_type,
      product,
      status: 'pending',
      timestamp: new Date().toISOString(),
      filled_quantity: 0,
      pending_quantity: parseInt(quantity),
      average_price: 0,
      user_id: userId
    };

    // In production, place order with Upstox API
    /*
    const response = await axios.post(`${UPSTOX_API_BASE}/order/place`, {
      quantity: parseInt(quantity),
      product,
      validity: 'DAY',
      price: parseFloat(price),
      tag: 'copy_trading',
      instrument_token: instrument_key,
      order_type,
      transaction_type,
      disclosed_quantity: 0,
      trigger_price: 0,
      is_amo: false
    }, {
      headers: {
        'Authorization': `Bearer ${req.user.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    */

    // Simulate order execution
    setTimeout(() => {
      order.status = 'complete';
      order.filled_quantity = order.quantity;
      order.pending_quantity = 0;
      order.average_price = order.price;
      
      // Add to mock orders
      mockOrders.unshift(order);
      
      // Emit order update
      io.emit('order_update', order);
    }, 2000);

    // Store order
    mockOrders.unshift(order);

    // Emit order update via socket
    io.emit('new_order', order);

    // If this is a parent account, copy the trade to child accounts
    if (userRole === 'parent') {
      console.log('Parent trade executed - copying to child accounts');
      
      // Mock child order creation
      setTimeout(() => {
        const childOrder = {
          ...order,
          order_id: `CHILD_${order.order_id}`,
          user_id: 'child_user_id',
          parent_order_id: order.order_id
        };
        
        mockOrders.unshift(childOrder);
        io.emit('new_order', childOrder);
        
        // Simulate child order execution
        setTimeout(() => {
          childOrder.status = 'complete';
          childOrder.filled_quantity = childOrder.quantity;
          childOrder.pending_quantity = 0;
          childOrder.average_price = childOrder.price;
          
          io.emit('order_update', childOrder);
        }, 3000);
      }, 1000);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || 'Failed to place order' 
    });
  }
});

router.delete('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // In production, cancel order with Upstox API
    /*
    const response = await axios.delete(`${UPSTOX_API_BASE}/order/cancel`, {
      headers: {
        'Authorization': `Bearer ${req.user.access_token}`
      },
      data: {
        order_id: orderId
      }
    });
    */

    // Update order status
    const orderIndex = mockOrders.findIndex(order => order.order_id === orderId);
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = 'cancelled';
      io.emit('order_update', mockOrders[orderIndex]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel order' });
  }
});

router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    // Calculate portfolio values from positions
    const totalValue = mockPositions.reduce((sum, pos) => sum + (pos.last_price * pos.quantity), 0);
    const dayPnl = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    
    const portfolio = {
      total_value: totalValue,
      day_pnl: dayPnl,
      total_pnl: dayPnl, // Simplified for demo
      positions: mockPositions
    };

    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio' });
  }
});

// Get market data for instruments
router.get('/market-data/:instrumentKey', authenticateToken, async (req, res) => {
  try {
    const { instrumentKey } = req.params;
    
    // In production, fetch from Upstox market data API
    const mockMarketData = {
      instrument_key: instrumentKey,
      last_price: 2500 + Math.random() * 100,
      close_price: 2480,
      day_change: Math.random() * 50 - 25,
      day_change_percentage: Math.random() * 4 - 2,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, data: mockMarketData });
  } catch (error) {
    console.error('Market data fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market data' });
  }
});

export default router;