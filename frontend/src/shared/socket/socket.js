import { io } from 'socket.io-client';

/**
 * Single Socket.IO client instance shared across the whole app.
 *
 * Singleton pattern: importing this module anywhere gives the same
 * socket object. This prevents multiple connections being opened
 * when components mount/unmount.
 *
 * autoConnect: false so the connection is opened explicitly by
 * SocketContext, giving us control over timing.
 */
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;