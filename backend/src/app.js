const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const songRoutes = require("./routes/song.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

// Configure CORS with dynamic origin
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://moodify-omzs.onrender.com",
  // Add other production frontend URLs here
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

/**
 * Routes
 */
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

app.use("/api/songs", songRoutes);

module.exports = app;
