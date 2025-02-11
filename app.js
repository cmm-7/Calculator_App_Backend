//DEPENDENCIES
const cors = require("cors");
const express = require("express");

//CONFIGURATIONS
const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());

//ROUTES
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//EXPORT
module.exports = app;
