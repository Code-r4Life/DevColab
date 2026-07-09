let notificationNamespace;

export const initNotificationSocket = (io) => {
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

export const getNotificationIo = () => notificationNamespace;

export default initNotificationSocket;