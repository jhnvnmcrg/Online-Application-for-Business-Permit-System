const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Middleware to verify user is an Admin or Processor
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.userType !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

/**
 * Middleware to verify user is a Superadmin
 */
function requireSuperadmin(req, res, next) {
  if (!req.user || req.user.userType !== 'Admin' || req.user.role !== 'Superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Superadmin access required'
    });
  }
  next();
}

/**
 * Middleware to verify user is a Processor
 */
function requireProcessor(req, res, next) {
  if (!req.user || req.user.userType !== 'Admin' || req.user.role !== 'Processor') {
    return res.status(403).json({
      success: false,
      message: 'Processor access required'
    });
  }
  next();
}

/**
 * Middleware to verify user is an Owner
 */
function requireOwner(req, res, next) {
  if (!req.user || req.user.userType !== 'Owner') {
    return res.status(403).json({
      success: false,
      message: 'Owner access required'
    });
  }
  next();
}

/**
 * Middleware to verify user is either Admin or Owner of the resource
 */
function requireAdminOrOwner(req, res, next) {
  const ownerId = req.params.ownerId || req.body.ownerId;

  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Allow if user is admin
  if (req.user.userType === 'Admin') {
    return next();
  }

  // Allow if user is the owner of the resource
  if (req.user.userType === 'Owner' && req.user.userId === parseInt(ownerId)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperadmin,
  requireProcessor,
  requireOwner,
  requireAdminOrOwner
};
