import registerBoardSocket from './board.socket.js';
import registerPresenceSocket from './presence.socket.js';
import registerNotificationSocket from './notification.socket.js';
import registerWikiSocket from './wiki.socket.js';
import initChatSocket from './chat.socket.js';

const registerSockets = (io) => {
  registerBoardSocket(io);
  registerPresenceSocket(io);
  registerNotificationSocket(io);
  registerWikiSocket(io);
  initChatSocket(io);
};

export default registerSockets;