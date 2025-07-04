export const handleSocketConnection = (io, socket) => {
  console.log('User connected:', socket.id);

  // Join room based on user role
  socket.on('join_room', (data) => {
    const { userId, role } = data;
    
    if (role === 'parent') {
      socket.join(`parent_${userId}`);
    } else {
      socket.join(`child_${userId}`);
    }
    
    console.log(`User ${userId} joined as ${role}`);
  });

  // Handle real-time market data subscription
  socket.on('subscribe_market_data', (instruments) => {
    console.log('Subscribing to market data:', instruments);
    
    // In production, subscribe to Upstox WebSocket for real-time data
    // Mock real-time data updates
    const interval = setInterval(() => {
      const mockMarketData = {
        instrument_key: 'NSE_EQ|INE002A01018',
        last_price: 2500 + Math.random() * 100,
        day_change: Math.random() * 50 - 25,
        day_change_percentage: Math.random() * 4 - 2,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
      };
      
      socket.emit('market_data_update', mockMarketData);
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });

  // Handle trade copy signals
  socket.on('parent_trade_executed', (tradeData) => {
    // Broadcast to all child accounts
    socket.broadcast.emit('copy_trade_signal', tradeData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};