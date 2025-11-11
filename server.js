import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cors from "cors";

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(cors());
app.use("/auth", authRoutes);;
const PORT = process.env.PORT || 8888;

// Simple route for testing
app.get("/", (req, res) => {
  res.send("🎵 Spotify API backend running successfully!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
