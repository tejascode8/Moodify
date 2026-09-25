const Redis = require("ioredis");

let redis;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return Math.min(times * 100, 2000);
    },
  });

  redis.connect().catch((err) => {
    console.warn("Redis connection notice (running with in-memory fallback):", err.message);
  });

  redis.on("connect", () => {
    console.log("Connected to Redis");
  });

  redis.on("error", (err) => {
    // Suppress unhandled crash on offline Redis
    // console.warn("Redis offline notice:", err.message);
  });
} catch (e) {
  console.warn("Redis initialization notice:", e.message);
}

// In-memory fallback cache if Redis instance is unreachable
const memoryFallback = new Map();

const safeCache = {
  async set(key, value, mode, duration) {
    try {
      if (redis && redis.status === "ready") {
        if (mode && duration) {
          return await redis.set(key, value, mode, duration);
        }
        return await redis.set(key, value);
      }
    } catch {
      // fallback
    }
    memoryFallback.set(key, value);
    return "OK";
  },

  async get(key) {
    try {
      if (redis && redis.status === "ready") {
        return await redis.get(key);
      }
    } catch {
      // fallback
    }
    return memoryFallback.get(key) || null;
  },

  async del(key) {
    try {
      if (redis && redis.status === "ready") {
        return await redis.del(key);
      }
    } catch {
      // fallback
    }
    return memoryFallback.delete(key);
  }
};

module.exports = safeCache;
