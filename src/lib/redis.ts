import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));

let isConnected = false;
export const getRedisClient = async () => {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
  return redis;
};
