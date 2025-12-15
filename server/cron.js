const cron = require('node-cron');
const { getDB } = require('./db');

function initScheduler() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const db = getDB();
            const now = new Date();
            // Format time as HH:MM (24-hour) to match storage
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;

            console.log(`[Scheduler] Checking for reminders at ${currentTime}...`);

            const habitsToRemind = await db.all(
                'SELECT * FROM habits WHERE isReminderEnabled = 1 AND reminderTime = ?',
                [currentTime]
            );

            habitsToRemind.forEach(habit => {
                sendNotification(habit);
            });

        } catch (err) {
            console.error('[Scheduler] Error:', err);
        }
    });

    console.log('Scheduler initialized');
}

function sendNotification(habit) {
    // In a real app, this would send an email or push notification
    console.log('------------------------------------------------');
    console.log(`🔔 REMINDER: Time to work on your habit: "${habit.title}"`);
    console.log('------------------------------------------------');
}

module.exports = { initScheduler };
