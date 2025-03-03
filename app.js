//DEPENDENCIES
const cors = require("cors");
const express = require("express");
const account = require("./controller/authController");
const calculations = require("./controller/calculationsController");

//CONFIGURATIONS
const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());

//ROUTES
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/account", account);

app.use("/calculations", calculations);

//ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

//EXPORT
module.exports = app;
