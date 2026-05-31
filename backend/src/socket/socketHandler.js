
let _io = null;

/**
 * Initialize Socket.IO and bind all events.
 * @param {import('socket.io').Server} io
 */
export const initSocket = (io) => {
  _io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ── Room management ──────────────────────────────────────────────────

    /**
     * Client joins a specific incident room.
     * Only emitted when a user opens an incident detail page.
     */
    socket.on("join:incident", ({ incidentId }) => {
      if (!incidentId) return;
      socket.join(`incident:${incidentId}`);
      console.log(`   ↳ ${socket.id} joined room: incident:${incidentId}`);
    });

    /**
     * Client leaves the incident room.
     * Emitted in React useEffect cleanup (component unmount).
     */
    socket.on("leave:incident", ({ incidentId }) => {
      if (!incidentId) return;
      socket.leave(`incident:${incidentId}`);
      console.log(`   ↳ ${socket.id} left room: incident:${incidentId}`);
    });

    // ── Disconnect ───────────────────────────────────────────────────────

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });
};

/**
 * Get the io instance for use in controllers/services.
 * Throws if called before initSocket().
 */
export const getIO = () => {
  if (!_io) {
    throw new Error("Socket.IO has not been initialized. Call initSocket(io) first.");
  }
  return _io;
};
