import { io } from 'socket.io-client';
import { getSocketToken } from './api';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5000`;
};

const SOCKET_URL = getSocketUrl();

const withAuth = () => ({
  autoConnect: false,
  withCredentials: true, 
  auth: { token: getSocketToken() }, 
});

export const boardSocket = io(`${SOCKET_URL}/board`, withAuth());
export const presenceSocket = io(`${SOCKET_URL}/presence`, withAuth());
export const wikiSocket = io(`${SOCKET_URL}/wiki`, withAuth());
export const notificationSocket = io(`${SOCKET_URL}/notifications`, withAuth());

// NEW: Export the chat socket using your existing auth setup
export const chatSocket = io(`${SOCKET_URL}/chat`, withAuth());

export const refreshSocketAuth = () => {
  const token = getSocketToken();
  // Added chatSocket to the refresh loop
  [boardSocket, presenceSocket, notificationSocket, wikiSocket, chatSocket].forEach((socket) => {
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  });
};

export const disconnectSockets = () => {
  // Added chatSocket to the disconnect loop
  [boardSocket, presenceSocket, notificationSocket, wikiSocket, chatSocket].forEach((socket) => socket.disconnect());
};