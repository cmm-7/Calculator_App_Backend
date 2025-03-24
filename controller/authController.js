const express = require("express");
const { admin, authenticate } = require("../middleware/firebase");
const db = require("../db/dbConfig");
const {
  createUser,
  getUserById,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  storeVerificationCode,
  verifyCode,
} = require("../queries/authQueries");
const { sendVerificationCode } = require("../services/emailService");

const auth = express.Router();

// Signup Route (Verifies Firebase Token)
// Signup Route (Verifies Firebase Token)
auth.post("/signup", async (req, res) => {
  try {
    console.log("🔥 Received signup request...");

    // Extract Firebase token from Headers
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      console.log("❌ Missing Firebase ID token in Headers");
      return res
        .status(400)
        .json({ error: "Missing Firebase ID token in Headers" });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    console.log(`🔹 Firebase Verified: UID=${uid}, Email=${email}`);

    if (!uid || !email) {
      console.log("❌ Invalid token data");
      return res.status(400).json({ error: "Invalid token data" });
    }

    // 🛠 **Ensure User is Stored in PostgreSQL**
    const existingUser = await getUserById(uid);
    if (existingUser) {
      console.log("⚠️ User already exists in DB");
      return res.status(400).json({ error: "User already exists." });
    }

    console.log("✅ Storing user in database...");
    await createUser(uid, email);

    console.log("🎉 User successfully signed up!");

    // ✅ Return a valid user object
    res.status(201).json({
      message: "User signed up successfully",
      user: { uid, email }, // 👈 Ensure this is sent to frontend
    });
  } catch (error) {
    console.error("❌ Error signing up user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route (Requires Authentication)
auth.post("/login", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received login request...");

    if (!req.user) {
      console.log("❌ Unauthorized: No user found in request.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { uid, email } = req.user;
    console.log(`🔹 Firebase Verified: UID=${uid}, Email=${email}`);

    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid authorization header found");
      return res.status(401).json({ error: "No valid authorization token" });
    }
    const token = authHeader.split(" ")[1];

    // Check if user exists in PostgreSQL
    const existingUser = await getUserById(uid);
    if (!existingUser) {
      console.log("⚠️ User not found in PostgreSQL. Prompting signup.");
      return res
        .status(404)
        .json({ error: "User not found. Please sign up first." });
    }

    // Check if 2FA is enabled
    if (existingUser.two_factor_enabled) {
      console.log(
        "🔒 2FA is enabled for user, preparing to send verification code..."
      );

      try {
        // Generate and store verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("📝 Generated verification code");

        await storeVerificationCode(uid, code);
        console.log("💾 Stored verification code in database");

        // Send verification code
        await sendVerificationCode(email, code);
        console.log("✉️ Verification code sent successfully!");

        return res.status(200).json({
          requires2FA: true,
          tempToken: token,
          message: "2FA code sent to email",
        });
      } catch (twoFactorError) {
        console.error("❌ 2FA Error Details:", twoFactorError);

        // Cleanup stored code if email sending fails
        try {
          await db.none("DELETE FROM verification_codes WHERE user_id = $1", [
            uid,
          ]);
          console.log("🧹 Cleaned up stored verification code after error");
        } catch (cleanupError) {
          console.error("❌ Cleanup error:", cleanupError);
        }

        return res.status(500).json({
          error: "Failed to send verification code",
          details: twoFactorError.message,
        });
      }
    }

    console.log("✅ User found in database! Logging in...");
    res.status(200).json({ message: "User authenticated", user: existingUser });
  } catch (error) {
    console.error("❌ Error during authentication:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
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

// Send 2FA verification code
auth.post("/send-verification-code", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to send verification code...");

    const { uid, email } = req.user;
    console.log(`🔹 Sending verification code to: ${email}`);

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Store the code in the database with expiration
      await storeVerificationCode(uid, code);
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return res
        .status(500)
        .json({ error: "Failed to store verification code" });
    }

    try {
      // Send the code via email
      await sendVerificationCode(email, code);
    } catch (emailError) {
      console.error("❌ Email error details:", emailError);
      // Delete the stored code if email sending fails
      try {
        await db.none("DELETE FROM verification_codes WHERE user_id = $1", [
          uid,
        ]);
      } catch (cleanupError) {
        console.error("❌ Cleanup error:", cleanupError);
      }
      return res
        .status(500)
        .json({ error: `Email error: ${emailError.message}` });
    }

    console.log("✅ Verification code sent successfully!");
    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("❌ General error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify 2FA code and enable 2FA
auth.post("/verify-2fa-code", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to verify 2FA code...");

    const { uid } = req.user;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    // Verify the code
    const isValid = await verifyCode(uid, code);
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    // Get user data
    const user = await getUserById(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Two-Factor Authentication verified successfully!");
    res.status(200).json({
      message: "Two-Factor Authentication verified",
      user: user,
    });
  } catch (error) {
    console.error("❌ Error verifying code:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

module.exports = auth;
