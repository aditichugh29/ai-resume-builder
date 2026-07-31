import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. No token provided.",
      });
    }

    // 🔥 THE FIX: Check if the token starts with "Bearer " and strip it out
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1]; 
    }

    // Now 'token' is purely the JWT string (eyJ...)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized. Invalid token.",
    });
  }
};

export default protect;