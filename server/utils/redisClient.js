// utils/redisClient.js
const { createClient } = require('redis');

let redisClient;

if (!global.redisClient) {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD,
  });

  redisClient.connect().catch(console.error);

  global.redisClient = redisClient;
} else {
  redisClient = global.redisClient;
}

module.exports = redisClient;
