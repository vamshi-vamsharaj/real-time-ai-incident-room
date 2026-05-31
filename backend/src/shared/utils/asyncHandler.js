/**
 * Wraps an async route handler and forwards any thrown errors
 * to Express's next() so the global error handler catches them.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
