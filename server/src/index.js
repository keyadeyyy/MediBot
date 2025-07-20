const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");



dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
const prisma = new PrismaClient();

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


