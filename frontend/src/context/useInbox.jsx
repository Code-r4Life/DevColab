import { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspace } from './useWorkspace';
import api, { unwrap } from '../lib/api';

const InboxContext = createContext();

export const InboxProvider = ({ children }) => {
  const { currentWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const wsId = currentWorkspace?._id || currentWorkspace?.id;

  const fetchNotifications = async () => {
    if (!wsId) return;
    try {
      const res = unwrap(await api.get(`/notifications?workspaceId=${wsId}`));
      setNotifications(res.notifications || []);
      setUnreadCount(res.notifications.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load inbox stream:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // OPTIONAL polling mechanism: refresh every 30 seconds for live feel without websockets
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [wsId]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <InboxContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead }}>
      {children}
    </InboxContext.Provider>
  );
};

export const useInbox = () => useContext(InboxContext);