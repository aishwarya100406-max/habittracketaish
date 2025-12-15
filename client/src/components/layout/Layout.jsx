// client/src/components/layout/Layout.jsx
import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { isPrerequisitesMet, formatDate } from '../../utils/utils';

function Layout() {

  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem("habits");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    resetStreakIfMissed()
  }, []) // run once on mount

  const resetStreakIfMissed = () => {
    const today = new Date();
    habits.forEach(habit => {
      if (!habit.lastCompleted) return;
      const lastDate = new Date(habit.lastCompleted);

      const mode = (habit.freq?.mode || "").toLowerCase();
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      // Daily
      if (mode === "daily") {
        if (diffDays > 1) habit.currentStreak = 0;
      } else if (mode === "weekly") {
        if (diffDays > 7) habit.currentStreak = 0;
      } else if (mode === "custom") {
        const scheduledDays = habit.freq?.days || [];
        let tempDate = new Date(lastDate);
        while (tempDate < today) {
          tempDate.setDate(tempDate.getDate() + 1);
          const day = tempDate.getDay();
          const tempStr = tempDate.toISOString().split("T")[0];
          if (scheduledDays.includes(day) && !habit.progress.includes(tempStr)) {
            habit.currentStreak = 0;
            break;
          }
        }
      }
    });
    // Persist if we modified anything
    setHabits([...habits]);
  };

  // markHabitComplete now lives here (so it has access to state & setState)
  const markHabitComplete = (habitId, date) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;

    const dateInStr = formatDate(date);

    // Check prerequisites
    if (!isPrerequisitesMet(habit, habits, date)) {
      const unmet = (habit.prerequisites || [])
        .map(pid => habits.find(h => h.id === pid))
        .filter(h => h && !h.progress.includes(dateInStr))
        .map(h => h?.title || "Unknown")
        .join(", ");
      toast.error(`Locked: complete prerequisite(s) first: ${unmet}`);
      return false;
    }

    if (!Array.isArray(habit.progress)) habit.progress = [];
    if (!habit.progress.includes(dateInStr)) habit.progress.push(dateInStr);

    // Streak logic (preserving your prior algorithm, normalized)
    if (!habit.lastCompleted) {
      habit.currentStreak = 1;
    } else {
      const lastDate = new Date(habit.lastCompleted);
      const diffDays = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
      const mode = (habit.freq?.mode || "").toLowerCase();

      if (mode === "daily") {
        habit.currentStreak = diffDays === 1 ? habit.currentStreak + 1 : 1;
      } else if (mode === "weekly" || mode === "custom") {
        const scheduled = Array.isArray(habit.freq?.days) ? habit.freq.days : [];
        const lastDayIndex = scheduled.indexOf(lastDate.getDay());
        const nextIndex = lastDayIndex >= 0 ? (lastDayIndex + 1) % Math.max(1, scheduled.length) : -1;
        const nextScheduledDay = nextIndex >= 0 ? scheduled[nextIndex] : null;
        habit.currentStreak = nextScheduledDay !== null && date.getDay() === nextScheduledDay ? habit.currentStreak + 1 : 1;
      } else {
        habit.currentStreak = 1;
      }
    }

    if (habit.currentStreak > (habit.highestStreak || 0)) habit.highestStreak = habit.currentStreak;
    habit.lastCompleted = dateInStr;

    setHabits([...habits]);
    toast.success(`Marked "${habit.title}" complete`);
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="p-6">
        <ToastContainer position="top-right" autoClose={2000} />
        <Outlet context={{habits, setHabits, markHabitComplete}}/> 
      </main>
    </div>
  )
}

export default Layout