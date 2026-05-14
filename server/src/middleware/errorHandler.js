const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
