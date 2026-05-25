<<<<<<< HEAD
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Avatar, Button } from "../../components/ui";
import { useInbox } from "../../context/useInbox";
import { cn } from "../../assets/utils";
import { Check, MailOpen, BellOff } from "lucide-react";
import { timeAgo } from "../../lib/format";

const InboxPage = () => {
  const { notifications, fetchNotifications, markRead } = useInbox();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <PageShell breadcrumbs={["Dashboard", "Inbox"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Inbox</h1>
          <p className="text-gray-500">Stay up to date with tasks, assignments, and updates.</p>
        </div>

        {notifications.length === 0 ? (
          <div className="surface p-12 rounded-xl text-center text-gray-400 bg-white/5 flex flex-col items-center justify-center space-y-3">
            <BellOff size={36} className="text-gray-600" />
            <p>Your inbox is completely clear! No new updates.</p>
          </div>
        ) : (
          <div className="surface border border-dark-border rounded-2xl overflow-hidden bg-[#121214] divide-y divide-dark-border/40">
            {notifications.map((notification) => (
              <div 
                key={notification._id || notification.id} 
                className={cn(
                  "p-4 flex items-start justify-between gap-4 transition-colors",
                  !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-start gap-4 flex-1">
                  <Avatar 
                    src={notification.senderId?.avatar} 
                    name={notification.senderId?.name} 
                    size="md" 
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{notification.message}</p>
                    
                    <div className="flex items-center gap-4 pt-1">
                      <p className="text-[11px] text-gray-500">{timeAgo(notification.createdAt)}</p>
                      {notification.link && (
                        <Link 
                          to={notification.link}
                          onClick={() => markRead(notification._id)}
                          className="text-[11px] text-primary hover:underline font-semibold"
                        >
                          View Action Target →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(notification._id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-success hover:bg-success/10 transition-all"
                    title="Mark as Read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
=======
import { useEffect, useState } from "react";
import { PageShell } from "../../components/layout/PageShell";
import { Button } from "../../components/ui";
import api, { unwrap } from "../../lib/api";
import { timeAgo } from "../../lib/format";
import { cn } from "../../assets/utils";
import { useAuth } from "../../context/useAuth";
import { notifSocket } from "../../lib/socket";

const InboxPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = unwrap(await api.get("/notifications"));
      setNotifications(data.notifications || []);
    };
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    notifSocket.connect();
    notifSocket.emit("subscribe", { userId: user._id || user.id });
    const addNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    notifSocket.on("notification:new", addNotification);
    return () => {
      notifSocket.off("notification:new", addNotification);
    };
  }, [user]);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const openNotification = async (notification) => {
    await api.put(`/notifications/${notification._id || notification.id}/read`);
    setNotifications((prev) =>
      prev.map((item) =>
        (item._id || item.id) === (notification._id || notification.id)
          ? { ...item, read: true }
          : item
      )
    );
    if (notification.link) window.location.href = notification.link;
  };

  return (
    <PageShell breadcrumbs={["Inbox"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inbox</h1>
            <p className="text-gray-500">Stay on top of mentions and updates.</p>
          </div>
          <Button variant="secondary" onClick={markAllRead}>Mark all read</Button>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 && (
            <div className="surface p-6 rounded-xl text-sm text-gray-500">
              You have no notifications yet.
            </div>
          )}
          {notifications.map((notification) => (
            <button
              key={notification._id || notification.id}
              onClick={() => openNotification(notification)}
              className={cn(
                "surface w-full text-left p-4 rounded-xl transition-all card-interactive",
                !notification.read && "border border-primary/40"
              )}
            >
              <p className="font-medium">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">{timeAgo(notification.createdAt)}</p>
            </button>
          ))}
        </div>
>>>>>>> upstream/main
      </div>
    </PageShell>
  );
};

<<<<<<< HEAD
export default InboxPage;
=======
export default InboxPage;
>>>>>>> upstream/main
