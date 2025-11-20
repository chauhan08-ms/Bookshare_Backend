const admin = require("../config/firebase");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Ensure both uid and id exist
    req.user = {
      ...decoded,
      uid: decoded.uid,      // Firebase UID
      id: decoded.uid,       // For modules expecting id
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
