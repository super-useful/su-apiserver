module.exports = function captureStackTrace(error, method) {
  Error.captureStackTrace(error, method);

  return error;
};
