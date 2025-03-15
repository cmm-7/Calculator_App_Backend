const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null; // ✅ Extract the actual token

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log("🔍 Received Firebase Token:", token);

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    console.log("✅ Firebase Token Verified:", decodedToken);

    next();
  } catch (error) {
    console.error("❌ Error verifying Firebase token:", error);

    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ error: "Token expired. Please log in again." });
    }

    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

module.exports = { admin, authenticate };
