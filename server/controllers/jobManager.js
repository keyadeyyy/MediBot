// utils/JobManager.js
const reminderQueue = require('../queues/reminderQueue');
const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch(console.error);

class JobManager {
  static getRedisKey(reminderId) {
    return `reminder:${reminderId}:jobs`;
  }

  static async addJob(reminderId, jobName, jobData, options = {}) {
    const jobId = `${reminderId}-${Date.now()}`;
    try {
          const job = await reminderQueue.add(jobName, jobData, { ...options, jobId });
        // Track jobId in Redis Set
          await redisClient.sAdd(this.getRedisKey(reminderId), jobId);
          return job;
    } catch (error) {
         console.error("Failed to schedule job:", err);
          throw err;
    }
    
  }

  static async removeJobsByReminderId(reminderId) {
    const key = this.getRedisKey(reminderId);
    const jobIds = await redisClient.sMembers(key);

    for (const jobId of jobIds) {
      const job = await reminderQueue.getJob(jobId);
      if (job) await job.remove();
    }

    await redisClient.del(key);
  }
}

module.exports = {JobManager};
