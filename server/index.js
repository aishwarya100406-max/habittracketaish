const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initDB, getDB } = require('./db');
const { initScheduler } = require('./cron');

const app = express();
const PORT = 5000;
const SECRET_KEY = "super_secret_key_for_demo"; // Use ENV in production

app.use(cors());
app.use(express.json());

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const db = getDB();
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: "User already exists or server error" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- HABIT ROUTES ---

app.get('/api/habits', authenticateToken, async (req, res) => {
    try {
        const db = getDB();
        const today = new Date().toISOString().split('T')[0];

        // Get habits with their "completedToday" status
        // Using a left join to check if there's a completion record for today
        const habits = await db.all(`
      SELECT h.*, 
             CASE WHEN hc.id IS NOT NULL THEN 1 ELSE 0 END as completedToday
      FROM habits h
      LEFT JOIN habit_completions hc ON h.id = hc.habitId AND hc.date = ?
      WHERE h.userId = ?
    `, [today, req.user.id]);

        // Map boolean back to true/false for client convenience if needed, or keep 1/0
        const result = habits.map(h => ({
            ...h,
            completedToday: !!h.completedToday
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/habits', authenticateToken, async (req, res) => {
    const { title, reminderTime, isReminderEnabled } = req.body;
    try {
        const db = getDB();
        const result = await db.run(
            'INSERT INTO habits (userId, title, reminderTime, isReminderEnabled) VALUES (?, ?, ?, ?)',
            [req.user.id, title, reminderTime, isReminderEnabled ? 1 : 0]
        );
        const newHabit = await db.get('SELECT * FROM habits WHERE id = ?', [result.lastID]);
        res.json({ ...newHabit, completedToday: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/habits/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const db = getDB();
        const date = new Date().toISOString().split('T')[0];
        const habitId = req.params.id;

        // Verify ownership
        const habit = await db.get('SELECT * FROM habits WHERE id = ? AND userId = ?', [habitId, req.user.id]);
        if (!habit) return res.status(404).json({ error: "Habit not found" });

        // Check if already completed
        const existing = await db.get(
            'SELECT * FROM habit_completions WHERE habitId = ? AND date = ?',
            [habitId, date]
        );

        if (existing) {
            // Undo completion
            await db.run('DELETE FROM habit_completions WHERE id = ?', [existing.id]);
            res.json({ completed: false });
        } else {
            // Mark complete
            await db.run('INSERT INTO habit_completions (habitId, date) VALUES (?, ?)', [habitId, date]);
            res.json({ completed: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/summary', authenticateToken, async (req, res) => {
    try {
        const db = getDB();
        const userId = req.user.id;

        // Get last 7 days range
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        // Get all habits for user
        const totalHabits = (await db.get('SELECT COUNT(*) as count FROM habits WHERE userId = ?', [userId])).count;

        // Get completions for these days
        const stats = {};
        for (const date of dates) {
            const count = (await db.get(
                `SELECT COUNT(*) as completedCount 
                 FROM habit_completions hc 
                 JOIN habits h ON hc.habitId = h.id 
                 WHERE h.userId = ? AND hc.date = ?`,
                [userId, date]
            )).completedCount;

            stats[date] = {
                date,
                completed: count,
                total: totalHabits, // Assuming total habits is constant for simplicity in this view
                progress: totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0
            };
        }

        res.json(Object.values(stats));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/habits/:id', authenticateToken, async (req, res) => {
    // For simplicity, just toggling or updating basics.
    // In a full app, you'd handle specific updates.
    const { title, reminderTime, isReminderEnabled } = req.body;
    try {
        const db = getDB();
        // Check ownership
        const habit = await db.get('SELECT * FROM habits WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
        if (!habit) return res.status(404).json({ error: "Habit not found" });

        await db.run(
            'UPDATE habits SET title = ?, reminderTime = ?, isReminderEnabled = ? WHERE id = ?',
            [title || habit.title, reminderTime || habit.reminderTime, isReminderEnabled !== undefined ? (isReminderEnabled ? 1 : 0) : habit.isReminderEnabled, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Start Server
initDB().then(() => {
    initScheduler();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});