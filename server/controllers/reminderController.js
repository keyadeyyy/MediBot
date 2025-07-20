const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');
const reminderQueue = require('../queues/reminderQueue'); // path to your queue setup
const {JobManager} = require('../utils/jobManager');
const prisma = new PrismaClient();

const createReminder = async (req, res) => {
  try {
    const {
      medicine,
      dose,
      timesPerInterval,
      interval,
      duration,
      startTime,
      endTime,
    } = req.body;
    const userId = req.user.id;

    if (
      !medicine ||
      !dose ||
      !startTime ||
      !endTime ||
      !timesPerInterval ||
      !interval ||
      !duration
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true, name: true },
    });

    if (!user?.telegramId) {
      console.warn(`⚠️ No Telegram chat ID for user ${userId}. Skipping reminder creation.`);
      return res.status(400).json({ error: 'Telegram bot not linked.' });
    }

    const now = dayjs();
    const startDate = now.startOf('day');
    const endDate = startDate.add(duration, 'day');

    const reminder = await prisma.reminder.create({
      data: {
        medicine: medicine.trim(),
        dose: dose.trim(),
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        timesPerCycle: parseInt(timesPerInterval),
        cycleDays: parseInt(interval),
        userId,
      },
    });

    const triggers = computeReminderTimestamps({
      timesPerInterval: parseInt(timesPerInterval),
      interval: parseInt(interval),
      duration: parseInt(duration),
      startTime,
      endTime,
    });

    let latestTriggerTime = 0;

    try {
      for (const ts of triggers) {
        const delay = ts.getTime() - Date.now();
        if (ts.getTime() > latestTriggerTime) {
          latestTriggerTime = ts.getTime();
        }

        await JobManager.addJob(
          reminder.id,
          'sendReminder',
          {
            reminderId: reminder.id,
            medicine: medicine.trim(),
            dose: dose.trim(),
            telegramChatId: user.telegramId,
            userName: user.name,
          },
          {
            delay,
            attempts: 3,
          }
        );
      }

      // Schedule deactivation 1 minute after the last reminder
      await JobManager.addJob(
        reminder.id,
        'deactivateReminder',
        {
          reminderId: reminder.id,
        },
        {
          delay: latestTriggerTime - Date.now() + 60 * 1000,
          attempts: 3,
        }
      );

      res.status(201).json({ message: 'Reminder created and scheduled' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


function computeReminderTimestamps({
  timesPerInterval,
  interval,
  duration,
  startTime,
  endTime,
}) {
  const timestamps = [];

  const today = new Date();
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startMs = startHours * 60 + startMinutes;
  const endMs = endHours * 60 + endMinutes;

  if (endMs <= startMs || timesPerInterval <= 0 || interval <= 0 || duration <= 0) {
    return []; // Invalid input
  }

  // Minutes between each reminder in the day window
  const totalIntervalMinutes = endMs - startMs;
  const gap = totalIntervalMinutes / (timesPerInterval - 1 || 1);

  for (let day = 0; day < duration; day++) {
    if (day % interval !== 0) continue; // Only every `interval` days

    for (let i = 0; i < timesPerInterval; i++) {
      const minutes = startMs + gap * i;
      const hour = Math.floor(minutes / 60);
      const minute = Math.floor(minutes % 60);

      const timestamp = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + day,
        hour,
        minute,
        0,
        0
      );

      timestamps.push(timestamp);
    }
  }

  return timestamps;
}


const fetchReminder = async (req, res) => {
  const userId = req.user.id;

  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId, isActive: true },
      select: {
        id : true,
        medicine: true,
        dose: true,
        startDate: true,
        endDate: true,
        timesPerCycle: true,
        cycleDays: true,
      },
      orderBy: { startDate: "desc" }, // optional, sort latest first
    });

    const formattedReminders = reminders.map(r => ({
      ...r,
      startDate: r.startDate.toISOString().split('T')[0],
      endDate: r.endDate.toISOString().split('T')[0],
    }));

    res.json(formattedReminders);
  } catch (error) {
    console.error("Error fetching reminders:", error.message);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
};
const deleteReminder = async (req, res) => {
  const reminderId = parseInt(req.query.id);
  console.log(reminderId)
  const userId = req.user.id; // pulled from JWT via middleware

  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder || reminder.userId !== userId) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    // Optional: remove associated BullMQ job here if jobId is stored
    // await reminderQueue.removeJobs(reminder.jobId);
    await JobManager.removeJobsByReminderId(reminderId);
    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("Error deleting reminder:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { createReminder, fetchReminder, deleteReminder };
