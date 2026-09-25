# 🎧 Moodify Frontend Client

Next-generation, emotion-responsive web client for real-time facial expression music curation.

---

## ⚡ Key Highlights

- **AI Emotion Recognition**: Real-time 468-point facial landmark mesh tracking using MediaPipe Vision.
- **Pure Obsidian Black Architecture (`#000000`)**: Deep dark mode interface with frosted glass accents and glowing acoustic visualizers.
- **Guest Explorer Mode**: Unregistered visitors can explore all music and AI camera features seamlessly on their device; changes (liking, uploading, managing library) prompt a lightweight authentication gatekeeper.
- **Instant Preloader & Global Loader**: 0ms first-frame HTML/CSS preloader + full-page dynamic branded equalizer loader.
- **Persistent Saved Library**: Instant client-side and cloud-synchronized favorites management.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Styling**: SCSS with design system tokens and fluid dark/light theming
- **AI / Computer Vision**: `@mediapipe/tasks-vision`
- **Animations**: GSAP (GreenSock Animation Platform) + hardware-accelerated CSS keyframes
- **HTTP Client**: Axios with automatic cookie authentication

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `VITE_BACKEND_URL` matches your running backend:
```env
VITE_BACKEND_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

App will be available at: `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```
