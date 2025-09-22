// workers/reminderWorker.js
const { Worker } = require('bullmq');
const bot = require('../../bot');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};

const worker = new Worker(
  'reminderQueue',
  async (job) => {
    if (job.name === 'sendReminder') {
      const { medicine, dose, telegramChatId, userName } = job.data;
      const message = `💊 Hello ${userName || ''}, it's time to take your ${medicine} (${dose})`;

      try {
        await bot.telegram.sendMessage(telegramChatId, message);
        console.log(`✅ Reminder sent to ${telegramChatId}`);
        
        
      } catch (err) {
        if (err.response?.error_code === 429) {
          // Telegram rate limit hit - retry after delay
          const retryAfter = err.response.parameters?.retry_after || 5;
          console.log(`⚠️ Rate limited. Retrying in ${retryAfter}s...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          throw err; // BullMQ will re-queue
        }
        console.error(`❌ Permanent failure for ${telegramChatId}:`, err.message);
        throw err; // Will move to failed jobs
      }
    }

    if (job.name === 'deactivateReminder') {
      const { reminderId } = job.data;
      try {
        await prisma.reminder.update({
          where: { id: reminderId },
          data: { isActive: false },
        });
        console.log(`🛑 Reminder ${reminderId} deactivated.`);
      } catch (err) {
        console.error(`❌ DB update failed for ${reminderId}:`, err.message);
        throw err;
      }
    }
  },
  { 
    connection,
    limiter: { max: 30, duration: 1000 }, // 30 jobs/sec
    concurrency: 10 // Process 10 jobs in parallel (adjust based on server capacity)
  }
);

// Enhanced event listeners
worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} (${job.name}) failed after retries:`, err.message);
});

worker.on('completed', (job) => {
  console.log(`✔️ ${job.name} completed for job ${job.id}`);
});
worker.on('ready', () => console.log('✅ Worker is ready and connected to Redis'));
worker.on('active', (job) => console.log(`▶️ Job ${job.id} started: ${job.name}`));
worker.on('stalled', (jobId) => console.warn(`⚠️ Job ${jobId} stalled`));
