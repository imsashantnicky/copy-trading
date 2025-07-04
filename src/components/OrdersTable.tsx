import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { tradingService } from '../services/tradingService';
import { Order } from '../types/trading';
import { Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order_update', (updatedOrder: Order) => {
        setOrders(prev => 
          prev.map(order => 
            order.order_id === updatedOrder.order_id 
              ? updatedOrder 
              : order
          )
        );
      });

      socket.on('new_order', (newOrder: Order) => {
        setOrders(prev => [newOrder, ...prev]);
      });

      return () => {
        socket.off('order_update');
        socket.off('new_order');
      };
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const data = await tradingService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await tradingService.cancelOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Orders</h2>
        <button
          onClick={fetchOrders}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-6 py-3">Symbol</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">
                    {order.trading_symbol}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.transaction_type === 'BUY' 
                        ? 'bg-green-800 text-green-300' 
                        : 'bg-red-800 text-red-300'
                    }`}>
                      {order.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    ₹{order.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {format(new Date(order.timestamp), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {order.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.order_id)}
                        className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;