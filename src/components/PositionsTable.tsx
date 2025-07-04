import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { tradingService } from '../services/tradingService';
import { Position } from '../types/trading';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const PositionsTable: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('position_update', (updatedPosition: Position) => {
        setPositions(prev => 
          prev.map(pos => 
            pos.instrument_key === updatedPosition.instrument_key 
              ? updatedPosition 
              : pos
          )
        );
      });

      return () => {
        socket.off('position_update');
      };
    }
  }, [socket]);

  const fetchPositions = async () => {
    try {
      const data = await tradingService.getPositions();
      setPositions(data);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Positions</h2>
        <button
          onClick={fetchPositions}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No positions found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-6 py-3">Symbol</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Avg Price</th>
                <th className="px-6 py-3">LTP</th>
                <th className="px-6 py-3">P&L</th>
                <th className="px-6 py-3">Day Change</th>
                <th className="px-6 py-3">Product</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.instrument_key} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">
                    {position.trading_symbol}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {position.quantity}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {formatCurrency(position.average_price)}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {formatCurrency(position.last_price)}
                  </td>
                  <td className={`px-6 py-4 font-medium ${getPnlColor(position.pnl)}`}>
                    <div className="flex items-center space-x-1">
                      {position.pnl > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : position.pnl < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : null}
                      <span>{formatCurrency(position.pnl)}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${getPnlColor(position.day_change)}`}>
                    {position.day_change_percentage.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {position.product}
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

export default PositionsTable;