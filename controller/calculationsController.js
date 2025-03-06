const express = require("express");
const { authenticate } = require("../middleware/firebase");
const {
  getCalculations,
  createCalculation,
  updateCalculation,
  deleteCalculation,
} = require("../queries/calculationsQueries");

const calculations = express.Router();

// ✅ Get all calculations for the logged-in user
calculations.get("/", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to fetch calculations...");
    const { uid } = req.user;
    console.log(`🔹 Fetching calculations for UID: ${uid}`);

    const calculationsList = await getCalculations(uid);
    res.status(200).json(calculationsList);
  } catch (error) {
    console.error("❌ Error fetching calculations:", error);
    res.status(500).json({ error: "Failed to fetch calculations" });
  }
});

// ✅ Create a new calculation for the logged-in user
calculations.post("/", authenticate, async (req, res) => {
  try {
    console.log("🔥 Creating new calculation...");
    console.log("📥 Request Body:", req.body);

    const { uid } = req.user;
    const { expression, result } = req.body;

    if (!expression || !result) {
      console.log("❌ Missing required fields:", { expression, result });
      return res
        .status(400)
        .json({ error: "Expression and result are required" });
    }

    console.log(`🔹 Saving calculation for UID: ${uid}`);
    const newCalculationId = await createCalculation(uid, expression, result);

    res
      .status(201)
      .json({
        message: "Calculation saved successfully",
        id: newCalculationId,
      });
  } catch (error) {
    console.error("❌ Error creating calculation:", error);
    res.status(500).json({ error: "Failed to save calculation" });
  }
});

// ✅ Update a calculation (User must own it)
calculations.put("/:id", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to update a calculation...");
    const { uid } = req.user;
    const { id } = req.params;
    const { expression, result } = req.body;

    if (!expression || !result) {
      return res
        .status(400)
        .json({ error: "Expression and result are required" });
    }

    console.log(`🔹 Updating calculation ID: ${id} for UID: ${uid}`);
    const updatedCalculation = await updateCalculation(
      uid,
      id,
      expression,
      result
    );

    if (!updatedCalculation) {
      return res
        .status(404)
        .json({ error: "Calculation not found or not authorized" });
    }

    res
      .status(200)
      .json({
        message: "Calculation updated successfully",
        calculation: updatedCalculation,
      });
  } catch (error) {
    console.error("❌ Error updating calculation:", error);
    res.status(500).json({ error: "Failed to update calculation" });
  }
});

// ✅ Delete a calculation (User must own it)
calculations.delete("/:id", authenticate, async (req, res) => {
  try {
    console.log("🔥 Received request to delete a calculation...");
    const { uid } = req.user;
    const { id } = req.params;

    console.log(`🔹 Deleting calculation ID: ${id} for UID: ${uid}`);
    const deletedCalculation = await deleteCalculation(uid, id);

    if (!deletedCalculation) {
      return res
        .status(404)
        .json({ error: "Calculation not found or not authorized" });
    }

    res
      .status(200)
      .json({
        message: "Calculation deleted successfully",
        deleted: deletedCalculation,
      });
  } catch (error) {
    console.error("❌ Error deleting calculation:", error);
    res.status(500).json({ error: "Failed to delete calculation" });
  }
});

module.exports = calculations;
