module.exports = (io) => {
  io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);

      // Join user-specific room for notifications
      socket.on('joinUserRoom', (userId) => {
          socket.join(userId);
          console.log(`User ${userId} connected`);
      });

      // Handle new messages
      socket.on('sendMessage', async (messageData) => {
          try {
              // Save message to DB (implement in controller)
              const savedMessage = await messageData.saveMessage();

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

      // Typing indicator
      socket.on('typing', (conversationId) => {
          socket.to(conversationId).emit('userTyping', {
              userId: socket.userId
          });
      });

      // Mark message as read
      socket.on('markAsRead', (messageIds, conversationId) => {
          // Implement real-time marking as read
          socket.to(conversationId).emit('messageRead', {
              messageIds,
              readAt: new Date()
          });
      });

      // Disconnect
      socket.on('disconnect', () => {
          console.log(`User disconnected: ${socket.id}`);
      });
  });
};
