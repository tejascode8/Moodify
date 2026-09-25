# 🎵 Moodify - AI-Powered Emotion-Responsive Music Streaming Platform

<div align="center">

![Moodify Logo](https://img.shields.io/badge/Moodify-AI%20Music%20Platform-ff5722?style=for-the-badge&logo=music)
![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js)
![Express 5](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Cloud-dc382d?style=for-the-badge&logo=redis)

**Experience sound calibrated to your soul.** Real-time facial expression analysis to curate soundtracks matching your emotional state.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Project Structure](#-architecture--project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Endpoints](#-api-endpoints)
- [Security & Authentication](#-security--authentication)
- [License](#-license)

---

## 📋 Overview

**Moodify** is a full-stack, AI-driven web application that combines computer vision with intelligent audio curation. By analyzing facial micro-expressions via your webcam using Google's **MediaPipe Vision**, Moodify detects your real-time emotion (Joy, Serenity/Calm, Energy/Surprise, Melancholy/Sadness) and instantaneously calibrates matching audio soundscapes.

### 🌟 What Makes Moodify Unique?
- **Zero-Friction Guest Explorer**: Anyone can open the app, test the AI camera, and listen to music instantly without an account. Liking, uploading, or custom library management triggers a seamless authentication modal.
- **Pure Obsidian Black Dark Mode (`#000000`)**: Hardware-accelerated frosted glass refraction and customizable light/dark theme preference persisted in both cloud database and localStorage.
- **Hardware-Accelerated Visual Equalizers**: Dual audio waveforms, ambient stardust mesh particles, and synchronized beat frequencies.
- **Instant Preloader & Branded Global Loader**: Zero-delay 0ms HTML preloader with smooth transition to React hydration.

---

## ✨ Key Features

- **⚡ Real-Time AI Facial Recognition**: 468-point 3D facial landmark mesh tracking using `@mediapipe/tasks-vision`.
- **🎼 Emotion-Curated Soundtracks**: Instant playback tailored to Happy, Calm, Surprised, and Sad moods.
- **🛡️ Secure JWT Authentication**: HTTP-only, SameSite cookies with Redis session blacklisting and bcrypt password hashing.
- **🎧 High-Fidelity Audio Player**: Custom scrubber bar, volume control, repeat modes (`off`, `all`, `one`), shuffle, and playback speed controller.
- **📂 MP3 Track Uploads**: Multipart upload pipeline with automatic ID3 tag extraction and ImageKit CDN hosting.
- **💖 Persistent Saved Library**: Instant client-side and cloud-synchronized favorites management.
- **🚫 404 Route Protection**: Global catch-all route guard directing users back to safe navigation.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite**
- **React Router v7**
- **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision`)
- **SCSS / SASS** with CSS custom property design system
- **GSAP** (GreenSock Animation Platform)
- **Axios** with automatic credential handling

### Backend
- **Node.js** & **Express.js (v5)**
- **MongoDB** with Mongoose ORM
- **Redis** (`ioredis`) with resilient in-memory fallback
- **JWT (`jsonwebtoken`)** & **bcryptjs**
- **Multer** & **node-id3**
- **ImageKit** Cloud Storage SDK

---

## 📁 Architecture & Project Structure

```
Moodify/
├── backend/
│   ├── .env.example            # Backend environment template
│   ├── package.json            # Backend dependencies & scripts
│   ├── server.js               # HTTP server entry point
│   └── src/
│       ├── app.js              # Express app setup & CORS policy
│       ├── config/
│       │   ├── cache.js        # Redis connection & fallback cache
│       │   └── database.js     # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js  # Auth handlers (register, login, getMe, theme)
│       │   └── song.controller.js  # Track handlers (upload, get, delete)
│       ├── middlewares/
│       │   ├── auth.middleware.js  # JWT verification middleware
│       │   └── upload.middleware.js# Multer memory storage
│       ├── models/
│       │   ├── song.model.js   # Soundtrack schema
│       │   └── user.model.js   # User account & theme schema
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── song.routes.js
│       └── services/
│           └── storage.service.js # ImageKit upload service
│
├── frontend/
│   ├── index.html              # HTML entry with instant 0ms preloader
│   ├── package.json            # Frontend dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── App.jsx             # Top-level global loader gatekeeper
│       ├── app.routes.jsx      # Client-side router configuration
│       ├── main.jsx            # React root mount
│       └── features/
│           ├── auth/           # Authentication state & modals
│           │   ├── auth.context.jsx
│           │   ├── authStyle/
│           │   ├── components/ # AuthModal, Protected, FormGroup
│           │   ├── hooks/      # useAuth
│           │   ├── pages/      # Login, Register
│           │   └── services/   # auth.api.js
│           ├── expressions/    # MediaPipe camera & emotion HUD
│           │   ├── components/ # FaceExpression.jsx
│           │   ├── style/
│           │   └── utils/      # Vision model pipeline
│           ├── home/           # Main player & curated soundscapes
│           │   ├── components/ # Playlist, Player, UploadModal, LikedDrawer
│           │   ├── data/       # Default curated library
│           │   ├── hooks/      # useSong
│           │   ├── pages/      # Home.jsx
│           │   ├── service/    # SongContext.jsx, song.api.js
│           │   └── style/
│           └── shared/         # Reusable global design system
│               ├── components/ # Navbar, GlobalLoader, MoodAtmosphere
│               ├── pages/      # NotFound.jsx (404)
│               ├── style/      # global.scss, Navbar.scss, GlobalLoader.scss
│               └── utils/      # gsapAnimations.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas cluster URI
- **Redis**: Local instance or Redis Cloud instance

### 1. Clone Repository
```bash
git clone https://github.com/your-username/Moodify.git
cd Moodify
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env if backend runs on a custom port
npm run dev
```

Visit **`http://localhost:5173`** in your browser to experience Moodify.

---

## 🔐 Environment Configuration

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Server listening port | `3000` |
| `MONGO_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWTs | `random_32_character_string` |
| `REDIS_HOST` | Redis endpoint | `redis-12345.example.com` |
| `REDIS_PORT` | Redis port | `19186` |
| `REDIS_PASSWORD` | Redis password | `your_password` |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key for uploads | `private_...` |
| `FRONTEND_URL` | Allowed client origin for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_BACKEND_URL` | Base URL of the Moodify backend API | `http://localhost:3000` |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register`: Create a new user account & set session cookie.
- `POST /api/auth/login`: Authenticate existing user credentials.
- `GET /api/auth/get-me`: Retrieve active session profile.
- `PATCH /api/auth/theme`: Persist user theme preference (`light` / `dark`).
- `POST /api/auth/logout`: Invalidate session token in Redis & clear cookie.

### 🎼 Soundtracks (`/api/songs`)
- `GET /api/songs`: Retrieve mood-curated tracks (`?mood=happy&single=false`).
- `POST /api/songs`: Upload audio file (`multipart/form-data`) with ID3 tags.
- `DELETE /api/songs/:id`: Remove track from database.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
