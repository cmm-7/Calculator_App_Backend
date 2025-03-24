const admin = require("firebase-admin");
require("dotenv").config();

// Function to format private key correctly
const formatPrivateKey = (key) => {
  // If the key is undefined or null, throw an error
  if (!key) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY is not defined in environment variables"
    );
  }

  // Remove quotes from the beginning and end if they exist
  let cleanKey = key.replace(/^["']|["']$/g, "");

  // If the key already has the PEM header and footer, return it as is
  if (cleanKey.includes("-----BEGIN PRIVATE KEY-----")) {
    return cleanKey;
  }

  // If the key contains literal \n, replace them with actual newlines
  cleanKey = cleanKey.replace(/\\n/g, "\n");

  // Add PEM header and footer if they don't exist
  if (!cleanKey.includes("-----BEGIN PRIVATE KEY-----")) {
    cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
  }

  return cleanKey;
};

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
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
