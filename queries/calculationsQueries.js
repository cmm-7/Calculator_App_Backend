const db = require("../db/dbConfig");

const getCalculations = async (userId) => {
  try {
    return await db.any(
      "SELECT * FROM calculations WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Error fetching calculations from database");
  }
};

module.exports = { getCalculations };
