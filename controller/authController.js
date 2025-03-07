const express = require("express");
const { admin, authenticate } = require("../middleware/firebase");
const {
  createUser,
  getUserById,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
} = require("../queries/authQueries");

const auth = express.Router();

// Signup Route (Verifies Firebase Token)
auth.post("/signup", async (req, res) => {
  try {
    console.log("🔥 Received signup request...");

    // Extract Firebase token from Headers
    const token = req.headers.authorization;

    if (!token) {
      console.log("❌ Missing Firebase ID token in Headers");
      return res
        .status(400)
        .json({ error: "Missing Firebase ID token in Headers" });
    }

    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    console.log(`🔹 Firebase Verified: UID=${uid}, Email=${email}`);

    if (!uid || !email) {
      console.log("❌ Invalid token data");
      return res.status(400).json({ error: "Invalid token data" });
    }

    // Check if user already exists
    const existingUser = await getUserById(uid);
    if (existingUser) {
      console.log("⚠️ User already exists in DB");
      return res.status(400).json({ error: "User already exists." });
    }

    // Store new user in PostgreSQL
    console.log("✅ Storing user in database...");
    await createUser(uid, email);

    console.log("🎉 User successfully signed up!");
    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error("❌ Error signing up user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route (Requires Authentication)
auth.post("/login", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received login request..."); // Log when login is triggered

    if (!req.user) {
      console.log("❌ Unauthorized: No user found in request.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { uid, email } = req.user;
    console.log(`🔹 Firebase Verified: UID=${uid}, Email=${email}`);

    // Check if user exists in PostgreSQL
    const existingUser = await getUserById(uid);
    if (!existingUser) {
      console.log("⚠️ User not found in PostgreSQL. Prompting signup.");
      return res
        .status(404)
        .json({ error: "User not found. Please sign up first." });
    }

    console.log("✅ User found in database! Logging in...");
    res.status(200).json({ message: "User authenticated", user: existingUser });
  } catch (error) {
    console.error("❌ Error during authentication:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enable 2FA Route
auth.post("/enable-2fa", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to enable 2FA...");

    const { uid } = req.user;
    console.log(`🔹 Enable 2FA for user: ${uid}`);

    // Ensure user exists in the database
    const existingUser = await getUserById(uid);
    if (!existingUser) {
      console.log("❌ User not found in database.");
      return res.status(404).json({ error: "User not found" });
    }

    // Enable 2FA in the database
    await enableTwoFactorAuth(uid);
    console.log("✅ Two-Factor Authentication enabled for user!");
    res.status(200).json({ message: "Two-Factor Authentication enabled!" });
  } catch (error) {
    console.error("❌ Error enabling 2FA:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Disable 2FA Route
auth.post("/disable-2fa", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to disable 2FA...");

    const { uid } = req.user;
    console.log(`🔹 Disable 2FA for user: ${uid}`);

    // Ensure user exists in the database
    const existingUser = await getUserById(uid);
    if (!existingUser) {
      console.log("❌ User not found in database.");
      return res.status(404).json({ error: "User not found" });
    }

    // Disable 2FA in the database
    await disableTwoFactorAuth(uid);
    console.log("✅ Two-Factor Authentication disabled for user!");
    res.status(200).json({ message: "Two-Factor Authentication disabled!" });
  } catch (error) {
    console.error("❌ Error disabling 2FA:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = auth;
