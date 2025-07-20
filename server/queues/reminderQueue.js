// queues/reminderQueue.js
const { Queue } = require('bullmq');
const { createClient } = require('redis');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};

const reminderQueue = new Queue('reminderQueue', { connection });
// queues/reminderQueue.js or in your processor file


module.exports = reminderQueue;
