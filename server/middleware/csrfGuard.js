/**
 * CSRF Defense via Custom Request Header (X-Requested-With):
 * 
 * Why this choice for an SPA with httpOnly cookies:
 * Cross-Site Request Forgery (CSRF) relies on a browser automatically attaching
 * ambient credentials (httpOnly cookies) during cross-site requests initiated by
 * an attacker (e.g., via malicious <form>, <img>, or <iframe> elements).
 * 
 * Traditional HTML forms and cross-origin simple requests CANNOT set custom HTTP
 * headers like 'X-Requested-With' without triggering a CORS preflight (OPTIONS).
 * Because our CORS policy restricts origins to CLIENT_ORIGIN, an attacker's site
 * will be blocked during preflight and cannot forge this header.
 * 
 * Requiring 'X-Requested-With' on all state-changing (POST, PUT, DELETE) owner
 * operations provides robust, stateless CSRF immunity without the overhead and
 * synchronization issues of server-side CSRF tokens.
 */
const csrfGuard = (req, res, next) => {
  // Only check state-changing HTTP methods on owner routes
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const xRequestedWith = req.headers['x-requested-with'];
    if (!xRequestedWith || xRequestedWith.trim() === '') {
      return res.status(403).json({
        message: 'CSRF protection: X-Requested-With header required on state-changing owner operations.'
      });
    }
  }
  next();
};

module.exports = csrfGuard;
