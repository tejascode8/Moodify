# Moodify - Emotion-Based Music Recommendation System

## 📋 Project Overview

**Moodify** is an innovative web application that uses facial expression detection to recommend personalized music based on your current emotional state. The application captures your facial expressions via webcam, analyzes them using computer vision, and suggests songs that match your detected mood.

### Purpose & Problem Solved

- **Problem**: Finding music that matches your current emotional state can be time-consuming and subjective.
- **Solution**: Moodify automatically detects your facial expression and recommends music that aligns with your mood, creating a personalized listening experience.
- **Target Users**: Music enthusiasts, people looking for mood-based playlists, developers interested in emotion recognition technology.

## ✨ Key Features

- **Real-time Facial Expression Detection**: Uses MediaPipe Face Landmarker to detect emotions from webcam feed
- **Mood-Based Music Recommendations**: Suggests songs based on detected emotional state (happy, sad, neutral, surprised, etc.)
- **User Authentication**: Secure registration and login system with JWT tokens
- **Music Player**: Built-in audio player with play/pause, volume control, and playlist management
- **Song Upload & Management**: Users can upload their own songs with metadata extraction
- **Redis Caching**: Fast response times with Redis caching for frequently accessed data
- **Responsive Design**: Modern UI with SCSS styling that works across devices

### Advanced Capabilities

- **Computer Vision Integration**: Leverages Google's MediaPipe library for accurate facial landmark detection
- **MP3 Metadata Extraction**: Automatically extracts ID3 tags from uploaded audio files
- **Cloud Storage Integration**: Uses ImageKit for efficient media storage and delivery
- **Real-time Emotion Analysis**: Continuous facial expression monitoring with instant feedback

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library for building interactive interfaces
- **Vite** - Fast build tool and development server
- **React Router v7** - Client-side routing
- **Axios** - HTTP client for API requests
- **MediaPipe Tasks Vision** - Facial landmark detection and emotion analysis
- **Sass/SCSS** - CSS preprocessor for styling

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB with Mongoose** - NoSQL database for data persistence
- **Redis with ioredis** - In-memory data store for caching
- **JWT (jsonwebtoken)** - Authentication token management
- **bcryptjs** - Password hashing

### File Processing & Storage

- **Multer** - Middleware for handling multipart/form-data (file uploads)
- **node-id3** - ID3 tag reading/writing for MP3 files
- **ImageKit** - Cloud-based image and file storage with CDN

### Development Tools

- **ESLint** - Code linting and quality assurance
- **Nodemon** - Automatic server restart during development

## 📦 Dependencies

### Backend Dependencies (`backend/package.json`)

```json
{
  "@imagekit/nodejs": "^7.3.0",
  "bcryptjs": "^3.0.3",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "ioredis": "^5.10.0",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.2.3",
  "multer": "^2.1.1",
  "node-id3": "^0.2.9"
}
```

### Frontend Dependencies (`frontend/package.json`)

```json
{
  "@mediapipe/tasks-vision": "^0.10.32",
  "axios": "^1.13.6",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router": "^7.13.1",
  "react-router-dom": "^7.13.1",
  "sass": "^1.97.3"
}
```

### Frontend Dev Dependencies

```json
{
  "@eslint/js": "^9.39.1",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "eslint": "^9.39.1",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-react-refresh": "^0.4.24",
  "globals": "^16.5.0",
  "vite": "^7.3.1"
}
```

## 📁 Project Structure

```
Moodify/
├── backend/
│   ├── .env                    # Environment variables
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Entry point for backend server
│   └── src/
│       ├── app.js             # Express app configuration
│       ├── config/
│       │   ├── cache.js       # Redis configuration
│       │   └── database.js    # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── song.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── upload.middleware.js
│       ├── models/
│       │   ├── blacklist.model.js
│       │   ├── song.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── song.routes.js
│       └── services/
│           └── storage.service.js
└── frontend/
    ├── index.html            # Main HTML entry point
    ├── package.json          # Frontend dependencies
    ├── vite.config.js        # Vite configuration
    └── src/
        ├── App.jsx           # Root React component
        ├── app.routes.jsx    # Application routing
        ├── main.jsx          # React entry point
        └── features/
            ├── auth/         # Authentication feature
            │   ├── auth.context.jsx
            │   ├── components/
            │   ├── hooks/
            │   ├── pages/
            │   ├── services/
            │   └── authStyle/
            ├── expressions/  # Facial expression detection
            │   ├── components/FaceExpression.jsx
            │   ├── style/
            │   └── utils/utils.js
            ├── home/         # Music player & playlist
            │   ├── components/
            │   ├── hooks/
            │   ├── pages/
            │   ├── service/
            │   └── style/
            └── shared/       # Shared components & styles
                └── style/
```

### Key Directories Explained

- **`backend/src/controllers/`**: Contains business logic for handling API requests
- **`backend/src/models/`**: MongoDB schema definitions using Mongoose
- **`frontend/src/features/`**: Feature-based organization following clean architecture
- **`frontend/src/features/expressions/`**: Facial expression detection using MediaPipe
- **`frontend/src/features/home/`**: Music player, playlist, and song management

## 🚀 Installation Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or Atlas)
- **Redis** instance (local or cloud)
- **Webcam** for facial expression detection

### Step-by-Step Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Moodify
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   Create a `.env` file in the `backend` directory with the following variables:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_PASSWORD=your_redis_password
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   ```

5. **Start the Development Servers**

   **Terminal 1 - Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   Server will run on `http://localhost:3000`

   **Terminal 2 - Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

   Application will run on `http://localhost:5173`

## 🎮 Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Register/Login**: Create an account or login with existing credentials
3. **Allow Camera Access**: Grant permission for webcam access when prompted
4. **Detect Expression**: Click "Detect expression" button to analyze your facial expression
5. **Get Music Recommendations**: Based on your detected mood, songs will be recommended
6. **Play Music**: Use the built-in music player to listen to recommended tracks
7. **Upload Songs**: Navigate to upload section to add your own music files

### Example Output

```
Detected Expression: Happy
Recommended Songs: "Happy" by Pharrell Williams, "Good Vibrations" by The Beach Boys
```

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory with the following structure:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Redis Cache
REDIS_HOST=redis_host_address
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# File Storage (ImageKit)
IMAGEKIT_PRIVATE_KEY=private_your_imagekit_key
```

## 📡 API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### `POST /api/auth/login`

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Song Endpoints

#### `GET /api/songs?mood=happy`

Get songs based on mood.

**Response:**

```json
{
  "songs": [
    {
      "_id": "song_id",
      "title": "Happy Song",
      "artist": "Artist Name",
      "mood": "happy",
      "url": "https://ik.imagekit.io/.../song.mp3",
      "duration": 180
    }
  ]
}
```

#### `POST /api/songs/upload`

Upload a new song (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: MP3 audio file
- `title`: Song title
- `artist`: Artist name
- `mood`: Primary mood (happy, sad, calm, energetic)

## 🤝 Contributing

We welcome contributions to Moodify! Here's how you can help:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation when changing features

### Areas for Contribution

- Improve facial expression detection accuracy
- Add more music streaming platform integrations
- Enhance UI/UX design
- Write comprehensive tests
- Add TypeScript support
- Implement offline functionality

## 👤 Author

**Tejas** - Full Stack Developer

## 🙏 Acknowledgments

- **Google MediaPipe** for facial landmark detection technology
- **ImageKit** for media storage and CDN services
- **MongoDB Atlas** for cloud database hosting
- **Redis Labs** for Redis cloud hosting
- **React & Vite** communities for excellent documentation

### Roadmap

- [ ] Add support for multiple music streaming services (Spotify, YouTube Music)
- [ ] Implement machine learning for improved mood classification
- [ ] Add social features (share playlists, follow users)
- [ ] Develop mobile applications (React Native)
- [ ] Implement voice command support
- [ ] Add advanced audio analysis (BPM, key detection)

---

<div align="center">
  <p>Made with ❤️ and 🎵 by the Moodify team</p>
  <p>If you enjoy this project, please give it a ⭐ on GitHub!</p>
</div>
