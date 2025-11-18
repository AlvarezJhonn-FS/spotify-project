import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import querystring from "querystring";

dotenv.config();
const router = express.Router();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// Login route
router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
    });
  res.redirect(authUrl);
});

// Callback route
router.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Generate a JWT with Spotify tokens
    const token = jwt.sign(
      { access_token, refresh_token },
      process.env.JWT_SECRET,
      { expiresIn: `${expires_in}s` }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error exchanging code for token:", error.response?.data);
    res.status(400).send("Authentication failed");
  }
});

//Refresh route
router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) return res.status(400).json({ message: "Missing refresh token" });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Create new JWT
    const token = jwt.sign(
      { access_token, refresh_token },
      process.env.JWT_SECRET,
      { expiresIn: `${expires_in}s` }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data);
    res.status(400).send("Token refresh failed");
  }
});

export default router;
