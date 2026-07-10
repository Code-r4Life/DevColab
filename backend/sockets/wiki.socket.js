const activeUsersByPage = new Map();

const listActiveUsers = (pageId) => {
  return Array.from(activeUsersByPage.get(pageId)?.values() || []);
};

const removeSocketFromAllPages = (socketId) => {
  const affectedPages = [];
  for (const [pageId, users] of activeUsersByPage.entries()) {
    if (users.delete(socketId)) {
      affectedPages.push(pageId);
      if (users.size === 0) {
        activeUsersByPage.delete(pageId);
      }
    }
  }
  return affectedPages;
};

const registerWikiSocket = (io) => {
  const namespace = io.of('/wiki');

  namespace.on('connection', (socket) => {
    console.log(`🟢 Client connected to wiki namespace: ${socket.id}`);

    socket.on('join_wiki', ({ pageId, userId, userName, avatar }) => {
      if (!pageId || !userId) return;

      console.log(`👤 User ${userName} (${userId}) joined wiki page room: wiki:page:${pageId}`);
      socket.join(`wiki:page:${pageId}`);

      if (!activeUsersByPage.has(pageId)) {
        activeUsersByPage.set(pageId, new Map());
      }

      activeUsersByPage.get(pageId).set(socket.id, {
        socketId: socket.id,
        userId,
        userName,
        avatar
      });

      namespace.to(`wiki:page:${pageId}`).emit('wiki:users-update', listActiveUsers(pageId));
    });

    socket.on('leave_wiki', ({ pageId }) => {
      if (!pageId) return;

      console.log(`👤 Client ${socket.id} leaving wiki page room: wiki:page:${pageId}`);
      socket.leave(`wiki:page:${pageId}`);

      const users = activeUsersByPage.get(pageId);
      if (users) {
        users.delete(socket.id);
        if (users.size === 0) {
          activeUsersByPage.delete(pageId);
        }
      }

      namespace.to(`wiki:page:${pageId}`).emit('wiki:users-update', listActiveUsers(pageId));
    });

    socket.on('wiki:content-change', ({ pageId, content, title }) => {
      if (!pageId) return;
      console.log(`📝 Content change received from client ${socket.id} for page ${pageId}`);
      socket.to(`wiki:page:${pageId}`).emit('wiki:content-change', {
        pageId,
        content,
        title,
        senderSocketId: socket.id
      });
    });

    socket.on('wiki:cursor-move', ({ pageId, cursor, selectionRange }) => {
      if (!pageId) return;
      const userObj = activeUsersByPage.get(pageId)?.get(socket.id);
      if (!userObj) return;

      socket.to(`wiki:page:${pageId}`).emit('wiki:cursor-change', {
        pageId,
        userId: userObj.userId,
        userName: userObj.userName,
        avatar: userObj.avatar,
        socketId: socket.id,
        cursor,
        selectionRange
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected from wiki namespace: ${socket.id}`);
      const affectedPages = removeSocketFromAllPages(socket.id);
      affectedPages.forEach((pageId) => {
        namespace.to(`wiki:page:${pageId}`).emit('wiki:users-update', listActiveUsers(pageId));
      });
    });
  });
};

export default registerWikiSocket;
