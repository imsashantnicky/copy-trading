import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('🔌 Connecting to WebSocket...', {
        apiUrl: import.meta.env.VITE_API_URL,
        userId: user.user_id,
        role: user.role
      });

      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: {
          token: user.access_token,
          userId: user.user_id,
          role: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join room based on user role
        newSocket.emit('join_room', {
          userId: user.user_id,
          role: user.role
        });
      });

      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setIsConnected(false);
      });

      // Listen for trading events
      newSocket.on('new_order', (order) => {
        console.log('📋 New order received:', order);
      });

      newSocket.on('order_update', (order) => {
        console.log('🔄 Order update received:', order);
      });

      newSocket.on('copy_trade_signal', (tradeData) => {
        console.log('📊 Copy trade signal received:', tradeData);
      });

      newSocket.on('market_data_update', (marketData) => {
        console.log('📈 Market data update:', marketData);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Disconnecting WebSocket...');
        newSocket.close();
      };
    } else {
      console.log('👤 No user found, skipping WebSocket connection');
    }
  }, [user]);

  const value: SocketContextType = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};