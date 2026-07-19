const jwt = require('jsonwebtoken');

// This function checks if a request has a valid JWT token
// If valid, it allows the request to continue and attaches user info to it
// If invalid or missing, it blocks the request
const protect = (req, res, next) => {
  try {
    // Tokens are sent in the request header like: Authorization: Bearer eyJhbGc...
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    // Extract just the token part (remove the word "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verify the token is valid and wasn't tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info (userId, role) to the request object
    // so that any route using this middleware can access req.user
    req.user = decoded;

    // Continue to the actual route handler
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { protect };