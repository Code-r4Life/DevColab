/**
 * A wrapper utility that catches asynchronous errors in Express routes
 * and forwards them to the global error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;