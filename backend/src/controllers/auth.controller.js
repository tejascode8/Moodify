const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../config/cache");

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isAlreadyRegistered) {
    return res.status(400).json({
      message: "User with same email and username already exits",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
  });

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );

  const isProduction =
    process.env.NODE_ENV === "production" ||
    req.secure ||
    req.headers["x-forwarded-proto"] === "https";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      theme: user.theme || "dark",
    },
  });
}

async function loginUser(req, res) {
  const { email, password, username } = req.body;

  const user = await userModel
    .findOne({
      $or: [{ email }, { username }],
    })
    .select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );

  const isProduction =
    process.env.NODE_ENV === "production" ||
    req.secure ||
    req.headers["x-forwarded-proto"] === "https";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "User Logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      theme: user.theme || "light",
    },
  });
}

async function getMe(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(200).json({
        message: "No active session",
        user: null,
      });
    }

    const isTokenBlacklisted = await redis.get(token);
    if (isTokenBlacklisted) {
      return res.status(200).json({
        message: "Session expired",
        user: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(200).json({
        message: "User not found",
        user: null,
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        theme: user.theme || "light",
      },
    });
  } catch (err) {
    return res.status(200).json({
      message: "Unauthenticated",
      user: null,
    });
  }
}

async function updateTheme(req, res) {
  try {
    const { theme } = req.body;
    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({
        message: "Invalid theme. Must be 'light' or 'dark'.",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Theme updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        theme: user.theme || "light",
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update theme",
      error: err.message,
    });
  }
}

async function logoutUser(req, res) {
  const token = req.cookies.token;

  const isProduction =
    process.env.NODE_ENV === "production" ||
    req.secure ||
    req.headers["x-forwarded-proto"] === "https";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  if (token) {
    await redis.set(token, Date.now().toString(), "EX", 60 * 60);
  }

  res.status(200).json({
    message: "logout successfully",
  });
}

module.exports = { registerUser, loginUser, getMe, updateTheme, logoutUser };
