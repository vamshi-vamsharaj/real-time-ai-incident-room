import { env } from "../../config/env.js";

/**
 * Global error handling middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 *  - Mongoose validation errors (400)
 *  - Mongoose duplicate key errors (409)
 *  - Mongoose cast errors (bad ObjectId) (400)
 *  - Generic errors (500)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: bad ObjectId (e.g. /incidents/not-a-valid-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose: duplicate key (e.g. unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  console.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
