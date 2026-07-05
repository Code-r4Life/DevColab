import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationSocket } from '../lib/socket';
import api, { unwrap } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { cn } from '../assets/utils';
import { Avatar } from './ui'; 

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = unwrap(await api.get('/notifications'));
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const currentUserId = user._id || user.id;

    notificationSocket.connect();
    
    notificationSocket.on('connect', () => {
      notificationSocket.emit('join_notifications', currentUserId);
    });

    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };

    notificationSocket.on('new_notification', handleNewNotification);

    return () => {
      notificationSocket.off('connect');
      notificationSocket.off('new_notification', handleNewNotification);
      notificationSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-dark-surface animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 mt-2 w-80 bg-[#121212] border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">You are all caught up!</div>
            ) : (
              <div className="divide-y divide-dark-border">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id || notif.id} 
                    onClick={() => markAsRead(notif._id || notif.id)}
                    className={cn(
                      "p-4 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors", 
                      !notif.read ? "bg-primary/5" : ""
                    )}
                  >
                    <Avatar src={notif.senderId?.avatar} name={notif.senderId?.name || 'System'} size="sm" />
                    <div className="flex-1">
                      <p className={cn("text-sm", !notif.read ? "text-white font-medium" : "text-gray-400")}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;