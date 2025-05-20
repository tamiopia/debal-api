module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);
  
      // Join user to their personal room
      socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} connected`);
      });
  
      // Handle joining conversation rooms
      socket.on('joinConversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User joined conversation ${conversationId}`);
      });
  
      // Handle real-time typing indicators
      socket.on('typing', (conversationId) => {
        socket.to(`conversation_${conversationId}`).emit('userTyping', {
          userId: socket.userId
        });
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  };