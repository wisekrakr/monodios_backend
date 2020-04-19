const express = require("express");

//init express app
const app = express();

// Bodyparser Middleware
app.use(express.json({ extended: false }));

module.exports = { app };
