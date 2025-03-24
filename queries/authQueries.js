const db = require("../db/dbConfig");

const createUser = async (uid, email) => {
  try {
    await db.none("INSERT INTO users (id, email) VALUES ($1, $2)", [
      uid,
      email,
    ]);
    console.log(`✅ New user created: ${email}`);
  } catch (error) {
    console.error("❌ Database error creating user:", error);
    throw new Error("Error creating user in database");
  }
};

const getUserById = async (uid) => {
  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE id = $1", [uid]);
    if (!user) {
      console.log(`⚠️ No user found with UID: ${uid}`);
    } else {
      console.log(`✅ Found user: ${user.email}`);
    }
    return user;
  } catch (error) {
    console.error("❌ Database error fetching user:", error);
    throw new Error("Error fetching user from database");
  }
};

const enableTwoFactorAuth = async (uid) => {
  try {
    await db.none("UPDATE users SET two_factor_enabled = TRUE WHERE id = $1", [
      uid,
    ]);
    console.log(`✅ 2FA enabled for user: ${uid}`);
  } catch (error) {
    console.error("❌ Database error enabling 2FA:", error);
    throw new Error("Error enabling Two-Factor Authentication");
  }
};

const disableTwoFactorAuth = async (uid) => {
  try {
    await db.none("UPDATE users SET two_factor_enabled = false WHERE id = $1", [
      uid,
    ]);
    return { success: true };
  } catch (error) {
    console.error("❌ Error disabling 2FA:", error);
    throw new Error("Database error while disabling 2FA");
  }
};

const storeVerificationCode = async (uid, code) => {
  try {
    // Delete any existing codes for this user
    await db.none("DELETE FROM verification_codes WHERE user_id = $1", [uid]);

    // Store new code with 10-minute expiration
    await db.none(
      "INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [uid, code]
    );
    console.log(`✅ Verification code stored for user: ${uid}`);
  } catch (error) {
    console.error("❌ Database error storing verification code:", error);
    throw new Error("Error storing verification code");
  }
};

const verifyCode = async (uid, code) => {
  try {
    // Check if code exists and hasn't expired
    const result = await db.oneOrNone(
      "DELETE FROM verification_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() RETURNING *",
      [uid, code]
    );

    return !!result; // Return true if code was valid and not expired
  } catch (error) {
    console.error("❌ Database error verifying code:", error);
    throw new Error("Error verifying code");
  }
};

module.exports = {
  createUser,
  getUserById,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  storeVerificationCode,
  verifyCode,
};
