const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const prisma = require('../utils/prisma');
const rateLimit = require('express-rate-limit');




dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

const allowedOrigins = [
  "http://localhost:5000", // Vite dev server
  "https://medibot-frontend.onrender.com" // Replace with actual Render frontend URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter); // Apply rate limiter globally

app.use('/users', require('../routes/userRoutes'))


app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});


app.use((err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


