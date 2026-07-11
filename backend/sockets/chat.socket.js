import Message from '../models/Message.js';

let chatNamespace;

export const initChatSocket = (io) => {
  // Create a clean namespace just for chat traffic
  chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`💬 Client connected to chat namespace: ${socket.id}`);

    // 1. Join a specific channel room
    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
      console.log(`User joined channel room: ${channelId}`);
    });

    // 2. Leave a channel room (when switching channels)
    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
      console.log(`User left channel room: ${channelId}`);
    });

    // 3. Handle sending a new message
    socket.on('send_message', async (messageData) => {
      try {
        // Save the message to the database immediately
        const newMessage = await Message.create({
          channelId: messageData.channelId,
          senderId: messageData.senderId,
          content: messageData.content,
        });

        // Populate the sender's avatar and name so the UI can display it
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('senderId', 'name avatar email');

        // Broadcast the populated message to EVERYONE currently in that channel room
        chatNamespace.to(messageData.channelId).emit('receive_message', populatedMessage);
        
      } catch (error) {
        console.error('Error saving/sending chat message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // 4. Real-time Typing Indicators
    socket.on('typing', ({ channelId, userName }) => {
      // Broadcast to everyone in the room EXCEPT the person typing
      socket.to(channelId).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ channelId, userName }) => {
      socket.to(channelId).emit('user_stopped_typing', { userName });
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected from chat namespace');
    });
  });

  return chatNamespace;
};

export const getChatIo = () => chatNamespace;
export default initChatSocket;