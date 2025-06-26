// This middleware helps to avoid try/catch blocks in async/await functions
// It wraps async functions and passes any errors to the Express error handler

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
