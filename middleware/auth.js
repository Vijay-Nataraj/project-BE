const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../utils/config");

const auth = {
  checkAuth: async (req, res, next) => {
    try {
      const token = req.cookies.token; // Get the token from the cookie
      console.log("Token from cookie:", token);
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided" });
      }

      // Verify the token
      const user = jwt.verify(token, JWT_SECRET);
      const fullUser = await User.findById(user.id).select("-password");
      if (!fullUser) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found" });
      }

      req.user = fullUser; // Set the full user object in the request
      next(); // Proceed to the next middleware
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  },

  allowRoles: (roles) => {
    return async (req, res, next) => {
      try {
        const user = req.user; // Get the user from the request
        if (!user) {
          return res
            .status(401)
            .json({ message: "Unauthorized: User not found" });
        }

        if (!roles.includes(user.role)) {
          return res
            .status(403)
            .json({ message: "Forbidden: You do not have permission" });
        }

        next(); // Proceed to the next middleware
      } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    };
  },
};

module.exports = auth;
