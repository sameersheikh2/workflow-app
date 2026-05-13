const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
}

module.exports = { setupSocket };
