const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Default error
  let error = {
    message: err.message,
    status: err.status || 500,
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = {
      message: 'Validation Error',
      details: messages,
      status: 400,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = {
      message: `Duplicate field value entered`,
      status: 409,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
    };
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    details: error.details || null,
  });
};

module.exports = errorHandler;
