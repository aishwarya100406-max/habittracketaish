// client/src/components/HabitList.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import { isPrerequisitesMet, formatDate } from "../utils/utils";
import { toast } from "react-toastify";

function HabitList() {
  const { habits, markHabitComplete } = useOutletContext();

  const today = new Date();
  const todayStr = formatDate(today);

  const handleCheckbox = (habitId) => {
    const ok = markHabitComplete(habitId, today);
    if (!ok) {
      // markHabitComplete already toasts; extra behavior could be added here
    }
  }

  const showLockedInfo = (habit) => {
    const unmet = (habit.prerequisites || [])
      .map(pid => habits.find(h => h.id === pid))
      .filter(h => h && !h.progress.includes(todayStr))
      .map(h => h?.title || "Unknown");
    if (unmet.length === 0) toast.info("No unmet prerequisites.");
    else toast.info(`Locked until completed: ${unmet.join(", ")}`);
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 sm:p-5 shadow-xl h-full flex flex-col min-h-0">
      <h2 className="text-lg sm:text-xl font-semibold text-sky-300 mb-3 sm:mb-4 shrink-0">Your Habits</h2>
      {(!habits || habits.length === 0) ? (
        <p className="text-slate-400">No habits yet. Go add some 🚀</p>) :
        (
      <ul className="space-y-2 sm:space-y-3 overflow-y-auto pr-1 sm:pr-2 flex-1 min-h-0 custom-scrollbar">
        {habits.map((habit) => {
          const locked = !isPrerequisitesMet(habit, habits, today);
          const completedToday = Array.isArray(habit.progress) && habit.progress.includes(todayStr);
          return (
            <li
              key={habit.id}
              className="flex items-center justify-between bg-slate-800 rounded-xl p-2 sm:p-3 hover:bg-sky-900/40 hover:scale-[1.01] transition-all duration-300 ease-out border border-transparent hover:border-sky-500/30"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <input
                  type="checkbox"
                  checked={completedToday}
                  onChange={() => handleCheckbox(habit.id)}
                  disabled={locked}
                  className="w-4 h-4 sm:w-5 sm:h-5 accent-sky-500 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={`text-base sm:text-lg font-medium truncate ${locked ? 'text-slate-400' : ''}`}>{habit.title}</span>
                {locked && (
                  <button onClick={() => showLockedInfo(habit)} className="ml-2 text-sm text-slate-400 hover:text-sky-300" title="Locked: view prerequisites">
                    🔒
                  </button>
                )}
              </div>
              <span className="text-sky-400 font-semibold flex items-center gap-1 text-sm sm:text-base">
                🔥 {habit.currentStreak}
              </span>
            </li>
          )
        })}
      </ul>
        )}
    </div>
  );
}

export default HabitList