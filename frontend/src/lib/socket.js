import { io } from 'socket.io-client';
import { getSocketToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const withAuth = () => ({
  autoConnect: false,
  withCredentials: true, 
  auth: { token: getSocketToken() }, 
});

// Connected via clean namespaces
export const boardSocket = io(`${SOCKET_URL}/board`, withAuth());
export const presenceSocket = io(`${SOCKET_URL}/presence`, withAuth());
export const wikiSocket = io(`${SOCKET_URL}/wiki`, withAuth());

// UPDATED: Connecting directly to the /notifications namespace cleanly
export const notificationSocket = io(`${SOCKET_URL}/notifications`, withAuth());

export const refreshSocketAuth = () => {
  const token = getSocketToken();
  [boardSocket, presenceSocket, notificationSocket, wikiSocket].forEach((socket) => {
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  });
};

export const disconnectSockets = () => {
  [boardSocket, presenceSocket, notificationSocket, wikiSocket].forEach((socket) => socket.disconnect());
};