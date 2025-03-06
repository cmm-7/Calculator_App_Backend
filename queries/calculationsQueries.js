const db = require("../db/dbConfig");

// ✅ Get all calculations for a user
const getCalculations = async (uid) => {
  try {
    console.log(`📌 Fetching calculations for user: ${uid}`);
    const calculations = await db.any(
      "SELECT * FROM calculations WHERE user_id = $1 ORDER BY created_at DESC",
      [uid]
    );
    console.log("✅ Successfully fetched calculations.");
    return calculations;
  } catch (error) {
    console.error("❌ Database error fetching calculations:", error);
    throw new Error("Error fetching calculations from database");
  }
};

// ✅ Create a new calculation and return its ID
const createCalculation = async (uid, expression, result) => {
  try {
    console.log(
      `📌 Saving calculation: ${expression} = ${result} for user: ${uid}`
    );
    const newCalculation = await db.one(
      "INSERT INTO calculations (user_id, expression, result) VALUES ($1, $2, $3) RETURNING id",
      [uid, expression, result]
    );
    console.log(`✅ Calculation saved with ID: ${newCalculation.id}`);
    return newCalculation.id;
  } catch (error) {
    console.error("❌ Database error creating calculation:", error);
    throw new Error("Error saving calculation");
  }
};

// ✅ Update a calculation and return updated object
const updateCalculation = async (uid, id, expression, result) => {
  try {
    console.log(`📌 Updating calculation ID: ${id} for user: ${uid}`);
    const updatedCalculation = await db.oneOrNone(
      "UPDATE calculations SET expression = $1, result = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [expression, result, id, uid]
    );

    if (!updatedCalculation) {
      console.log("⚠️ Calculation not found or not authorized.");
      return null;
    }

    console.log("✅ Calculation updated successfully.");
    return updatedCalculation;
  } catch (error) {
    console.error("❌ Database error updating calculation:", error);
    throw new Error("Error updating calculation");
  }
};

// ✅ Delete a calculation and return deleted object
const deleteCalculation = async (uid, id) => {
  try {
    console.log(`📌 Deleting calculation ID: ${id} for user: ${uid}`);
    const deletedCalculation = await db.oneOrNone(
      "DELETE FROM calculations WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, uid]
    );

    if (!deletedCalculation) {
      console.log("⚠️ Calculation not found or not authorized.");
      return null;
    }

    console.log("✅ Calculation deleted successfully.");
    return deletedCalculation;
  } catch (error) {
    console.error("❌ Database error deleting calculation:", error);
    throw new Error("Error deleting calculation");
  }
};

module.exports = {
  getCalculations,
  createCalculation,
  updateCalculation,
  deleteCalculation,
};
