
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  // Prefer WebSocket, fall back to polling (mirrors server transports config)
  transports: ["websocket", "polling"],

  // Don't auto-connect — SocketContext controls connection lifecycle.
  // Set to true if you want immediate connection on module load.
  autoConnect: true,

  // Reconnection settings — sane defaults for a dev/demo environment
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// ── Debug logging in development ──────────────────────────────────────────
if (import.meta.env.DEV) {
  socket.on("connect", () => {
    console.log(`[Socket] Connected: ${socket.id}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Disconnected: ${reason}`);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
  });
}

export default socket;
