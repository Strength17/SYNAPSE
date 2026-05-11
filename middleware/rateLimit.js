import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter.
 * Limits to 100 requests per minute per IP/user.
 */
export const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // If authenticated, rate limit by userId. Otherwise, by IP.
    return req.user ? req.user.id : req.ip;
  }
});

/**
 * Stricter rate limiter for resource-intensive sync operations.
 * Limits to 20 sync requests per minute.
 */
export const syncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Sync limit reached. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});
