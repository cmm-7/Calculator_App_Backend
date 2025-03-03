const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware to verify Firebase ID Token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to the request
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticate;
