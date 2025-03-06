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

module.exports = {
  createUser,
  getUserById,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
};
