import { createClient } from "@redis/client";
import { RedisClientType } from "@redis/client";

export const getRedisClient = async () => {
  console.log("Connecting to Redis...");
  console.log("REDIS_CONNECTION_STRING", process.env.REDIS_CONNECTION_STRING);
  const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  await client.connect();
  return client as RedisClientType;
};
