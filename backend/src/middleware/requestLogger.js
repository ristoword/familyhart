/**
 * Request logger minimale e pulito
 */
const envTag = process.env.NODE_ENV || 'development';

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const msg = `[${envTag}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`;
    if (res.statusCode >= 500) {
      // eslint-disable-next-line no-console
      console.error(msg);
    } else {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  });
  next();
}
