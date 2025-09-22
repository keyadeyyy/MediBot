const { Queue } = require('bullmq');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};

const reminderQueue = new Queue('reminderQueue', { connection });

(async () => {
  await reminderQueue.add('sendReminder', {
    medicine: 'Paracetamol',
    dose: '500mg',
    telegramChatId: 8125189101, // replace with your own chatId
    userName: 'TestUser'
  });

  console.log('✅ Job added');
})();
