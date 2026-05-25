import Notification from '../models/Notification.js';

/**
 * Global Real-Time Notification Utility Engine
 * Handles explicit payload normalization for tasks, comments, and project updates.
 * * @param {Object} payload
 * @param {String} payload.userId - Map target for recipient user id
 * @param {String} payload.recipientId - Alternative map target for recipient user id
 * @param {String} payload.senderId - Author user id of the triggered action
 * @param {String} payload.workspaceId - Associated workspace tracking scope
 * @param {String} payload.projectId - Associated project tracking target
 * @param {String} payload.type - Action classifier ('assignment', 'mention', 'comment')
 * @param {String} payload.title - Optional bold title text header
 * @param {String} payload.message - Explicit readable communication body text
 * @param {String} payload.link - Client application router target redirection path
 */
export const createNotification = async (payload) => {
  try {
    // 1. Safe extraction and normalization of structural fields
    const recipientId = payload.userId || payload.recipientId;
    const senderId = payload.senderId;

    if (!recipientId || !senderId) {
      console.warn("⚠️ Notification skipped: Missing recipientId or senderId context properties.");
      return null;
    }

    // 2. Loophole Guard: Prevent sending alert streams to users for actions they did themselves
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    // 3. Fallback Mapping: Harmonize legacy 'type' strings with core notification layout definitions
    let mappedType = payload.type || 'task.assigned';
    let computedTitle = payload.title || 'Workspace Update';

    if (payload.type === 'assignment') {
      mappedType = 'task.assigned';
      computedTitle = 'New Task Assigned';
    } else if (payload.type === 'mention') {
      mappedType = 'task.mentioned';
      computedTitle = 'You Were Mentioned';
    }

    // 4. Persistence execution across your MongoDB pipeline container
    const notification = await Notification.create({
      recipientId,
      senderId,
      workspaceId: payload.workspaceId || null,
      projectId: payload.projectId || null,
      type: mappedType,
      title: computedTitle,
      message: payload.message || '',
      link: payload.link || '',
      isRead: false
    });

    return notification;
  } catch (error) {
    // Fail-safe execution tracking prevents utility dropouts from breaking your primary routing controllers
    console.error("❌ Critical breakdown caught inside createNotification utility engine:", error);
    return null;
  }
};