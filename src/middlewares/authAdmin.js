import jwt from "jsonwebtoken";

export const authAdmin = (req, res, next) => {
  try {
    // 1. Extract the token from the 'Authorization' header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      // Return 401 if no token is provided
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // 2. Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Authorize: Check if the decoded payload contains the 'admin' role
    if (decoded.role !== "admin") {
      // Return 403 if the user is authenticated but not an admin
      return res.status(403).json({ message: "Only admin can access this route" });
    }

    // 4. Attach the admin payload to the request and proceed
    req.admin = decoded;
    next();

  } catch (error) {
    // Handle errors like expired or invalid tokens
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};