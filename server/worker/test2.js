const { Queue } = require('bullmq');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const reminderQueue = new Queue('reminderQueue', { connection });

(async () => {
  const waiting = await reminderQueue.getWaiting();   // Jobs waiting to be processed
  const active = await reminderQueue.getActive();     // Jobs currently being processed
  const completed = await reminderQueue.getCompleted(); // Jobs finished successfully
  const failed = await reminderQueue.getFailed();     // Jobs that failed

  console.log('Waiting:', waiting.map(j => j.id));
  console.log('Active:', active.map(j => j.id));
  console.log('Completed:', completed.map(j => j.id));
  console.log('Failed:', failed.map(j => j.id));
})();
