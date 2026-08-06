import Redis from "ioredis";
import "dotenv/config";

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(url, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy() {
    return null; // Stop reconnection loops when Redis is unavailable
  },
});

// Suppress unhandled ECONNRESET / ECONNREFUSED socket errors
redis.on("error", (err) => {
  // Gracefully suppress socket errors when local Redis server is inactive
});
