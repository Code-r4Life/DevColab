import Message from '../models/Message.js';

let chatNamespace;

export const initChatSocket = (io) => {
  chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`💬 Client connected to chat namespace: ${socket.id}`);

    socket.on('join_channel', (channelId) => {
      if (!channelId) return;
      const room = channelId.toString();
      socket.join(room);
      console.log(`User joined channel room: ${room}`);
    });

    socket.on('leave_channel', (channelId) => {
      if (!channelId) return;
      const room = channelId.toString();
      socket.leave(room);
      console.log(`User left channel room: ${room}`);
    });

    socket.on('send_message', async (messageData) => {
      try {
        if (!messageData.channelId || !messageData.senderId || !messageData.content) {
          return socket.emit('message_error', { error: 'Missing required message fields' });
        }

        const room = messageData.channelId.toString();

        const newMessage = await Message.create({
          channelId: messageData.channelId,
          senderId: messageData.senderId,
          content: messageData.content,
        });

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('senderId', 'name avatar email');

        chatNamespace.to(room).emit('receive_message', populatedMessage);
        
      } catch (error) {
        console.error('Error saving/sending chat message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ channelId, userName }) => {
      if (!channelId) return;
      const room = channelId.toString();
      
      socket.to(room).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ channelId, userName }) => {
      if (!channelId) return;
      const room = channelId.toString();
      socket.to(room).emit('user_stopped_typing', { userName });
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected from chat namespace');
    });
  });

  return chatNamespace;
};

export const getChatIo = () => chatNamespace;
export default initChatSocket;