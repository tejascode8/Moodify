const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const songRoutes = require("./routes/song.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

// Configure CORS with dynamic origin
const configuredOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://moodify-omzs.onrender.com",
].filter(Boolean);

// Normalize origins (remove trailing slashes)
const allowedOrigins = configuredOrigins.map((origin) => origin.replace(/\/+$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server requests)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");
      const isAllowed = allowedOrigins.some((allowed) => allowed === normalizedOrigin);

      if (!isAllowed) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// Health check endpoint for Render / Uptime monitors
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// If frontend build exists (e.g., monolith deployment), serve static assets
const localDistPath = path.join(__dirname, "../../frontend/dist");
const rootDistPath = path.join(__dirname, "../../../frontend/dist");

let distPath = null;
if (fs.existsSync(localDistPath)) {
  distPath = localDistPath;
} else if (fs.existsSync(rootDistPath)) {
  distPath = rootDistPath;
}

if (distPath) {
  app.use(express.static(distPath));
  // Serve frontend index.html for all non-API GET routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Root route for standalone API server
  app.get("/", (req, res) => {
    return res.status(200).json({
      status: 200,
      message: "Moodify API is running successfully.",
      endpoints: {
        health: "/health",
        auth: "/api/auth",
        songs: "/api/songs",
      },
    });
  });

  // Catch-all 404 handler for nonexistent API endpoints
  app.use((req, res) => {
    return res.status(404).json({
      status: 404,
      message: `Cannot ${req.method} ${req.originalUrl}. Route does not exist.`,
    });
  });
}

module.exports = app;


