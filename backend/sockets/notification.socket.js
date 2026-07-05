let notificationNamespace;

export const initNotificationSocket = (io) => {
  // Create a namespace for notifications instead of a brand new server
  notificationNamespace = io.of('/notifications');

  notificationNamespace.on('connection', (socket) => {
    console.log(`🟢 Client connected to notification namespace: ${socket.id}`);

    socket.on('join_notifications', (userId) => {
      const roomName = `user_${userId}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} successfully joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected from notification namespace');
    });
  });

  return notificationNamespace;
};

// Export a helper to get the namespace loop from other files
export const getNotificationIo = () => notificationNamespace;

export default initNotificationSocket;