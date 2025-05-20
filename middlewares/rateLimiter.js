const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Strict message rate limiter (for sending messages)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each user to 10 messages per minute
  keyGenerator: (req) => {
    return req.user.id; // Limit by user ID instead of IP
  },
  message: {
    success: false,
    error: 'Message limit exceeded - please wait before sending more',
    code: 'MESSAGE_LIMIT_EXCEEDED'
  }
});

module.exports = {
  apiLimiter,
  messageLimiter
};