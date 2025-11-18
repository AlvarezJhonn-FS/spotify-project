import express from "express";
import axios from "axios";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
  try {
    const { access_token } = req.user;

    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching user profile:", err.response?.data);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

export default router;