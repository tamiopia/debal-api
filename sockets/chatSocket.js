module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);
  
      // Join user-specific room for notifications
      socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} connected`);
      });
  
      // Handle messages
      socket.on('sendMessage', async (messageData) => {
        try {
          // Save to DB (implement this in chatController)
          const savedMessage = {
            ...messageData,
            timestamp: new Date()
          };
  
          // Broadcast to conversation room
          io.to(messageData.conversationId).emit('newMessage', savedMessage);
  
          // Notify recipient if offline
          socket.to(messageData.recipientId).emit('messageNotification', {
            sender: messageData.senderName,
            preview: messageData.content.substring(0, 30)
          });
        } catch (err) {
          console.error('Message error:', err);
        }
      });
  
      // Typing indicators
      socket.on('typing', (conversationId) => {
        socket.to(conversationId).emit('userTyping', {
          userId: socket.userId
        });
      });
  
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  };