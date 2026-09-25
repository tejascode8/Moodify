# 🎵 Moodify Backend API

RESTful API and media microservices powering the Moodify emotion-responsive music platform.

---

## ⚡ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose
- **Cache & Blacklist**: Redis (`ioredis` with in-memory resilient fallback)
- **Authentication**: JWT (`jsonwebtoken`) stored in secure, HTTP-only cookies + `bcryptjs`
- **File Processing**: Multer + `node-id3` metadata parser
- **Media CDN**: ImageKit (`@imagekit/nodejs`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and provide your database, Redis, and ImageKit credentials:
```bash
cp .env.example .env
```

### 3. Run Server
```bash
# Development mode with Nodemon
npm run dev

# Production start
npm start
```

Default server URL: `http://localhost:3000`

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account & set session cookie | No |
| `POST` | `/api/auth/login` | Sign in with email/username & password | No |
| `GET` | `/api/auth/get-me` | Get currently authenticated user profile | Optional |
| `PATCH` | `/api/auth/theme` | Update user theme preference (`light` or `dark`) | Yes |
| `POST` | `/api/auth/logout` | Invalidate token in Redis & clear auth cookie | Yes |

### 🎼 Soundtracks (`/api/songs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/songs` | Get curated songs (filter by `?mood=happy&single=false`) | No |
| `POST` | `/api/songs` | Upload audio track (`multipart/form-data`) with ID3 tags | Yes |
| `DELETE` | `/api/songs/:id` | Delete song from database and library | Yes |

---

## 🛡️ Error & 404 Handling

Non-existent endpoints return structured JSON responses:
```json
{
  "status": 404,
  "message": "Cannot GET /api/unknown. Route does not exist."
}
```
