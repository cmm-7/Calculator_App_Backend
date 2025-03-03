const express = require("express");
const authenticate = require("../middleware/firebase");

const account = express.Router();

// Login Route (Frontend sends Firebase token)
account.post("/login", authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ message: "User authenticated", user: req.user });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = account;
