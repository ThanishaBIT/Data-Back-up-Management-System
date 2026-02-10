import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // ⭐ contains user id

    next();

  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

export default protect;
