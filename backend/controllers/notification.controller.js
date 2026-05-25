import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok, fail, message } from '../utils/http.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return fail(res, 'workspaceId is required', 422);

  const notifications = await Notification.find({
    recipientId: req.user.id,
    workspaceId
  })
  .populate('senderId', 'name avatar')
  .sort({ createdAt: -1 });

  return ok(res, { notifications });
});

// Alias 1
export const listNotifications = getNotifications;

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return fail(res, 'Notification not found', 404);
  return ok(res, { notification });
});

// Alias 2: The exact fix for your current crash!
export const markRead = markAsRead;

export const markAllAsRead = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;
  await Notification.updateMany(
    { recipientId: req.user.id, workspaceId, isRead: false },
    { isRead: true }
  );
  return ok(res, { success: true });
});

// Alias 3
export const markAllRead = markAllAsRead;

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipientId: req.user.id
  });
  if (!notification) return fail(res, 'Notification not found', 404);
  return message(res, 'Notification removed successfully');
});