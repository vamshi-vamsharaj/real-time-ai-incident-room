

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import { initSocket } from "./src/socket/socketHandler.js";

await connectDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

initSocket(io);

httpServer.listen(env.PORT, () => {
  console.log(`\n🚀 Server running on port ${env.PORT}`);
  console.log(`   Health check: http://localhost:${env.PORT}/health`);
  console.log(`   Environment: ${env.NODE_ENV}\n`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  httpServer.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
