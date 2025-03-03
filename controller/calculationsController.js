const express = require("express");
const authenticate = require("../middleware/firebase");
const { getCalculations } = require("../queries/calculationsQueries");

const calculations = express.Router();

calculations.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const calculationsData = await getCalculations(userId);

    if (!calculationsData.length) {
      return res
        .status(404)
        .json({ message: "No calculations found for this user." });
    }

    res.status(200).json(calculationsData);
  } catch (error) {
    console.error("Error fetching calculations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = calculations;
