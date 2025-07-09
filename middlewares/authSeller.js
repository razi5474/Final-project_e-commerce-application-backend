const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authSeller = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log("Cookies:", req.cookies);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check role
    if (!['seller', 'admin'].includes(decodedToken.role)) {
      return res.status(403).json({ message: "User is not authorized" });
    }

    // Use decodedToken.id instead of decoded.id ✅
    const seller = await User.findById(decodedToken.id);
    if (!seller || seller.isBlocked) {
      return res.status(403).json({ message: "Blocked or not found" });
    }

    // Attach user info to request
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authSeller;
