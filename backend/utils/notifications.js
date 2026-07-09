import Notification from '../models/Notification.js';
import { getNotificationIo } from '../sockets/notification.socket.js';

export const createNotification = async ({ userId, senderId, type, message, link }) => {
  try {
    const notification = await Notification.create({
      userId,
      senderId,
      type,
      message,
      link,
      read: false
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('senderId', 'name avatar');

    const io = getNotificationIo();
    
    if (io) {
      const roomName = `user_${userId.toString()}`; 
      console.log(`Backend Socket: 🚀 Attempting to emit to room [${roomName}]`);
      io.to(roomName).emit('new_notification', populatedNotification);
    } else {
      console.error('Backend Socket Error: io is completely undefined! The socket server did not initialize.');
    }

    return populatedNotification;
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};