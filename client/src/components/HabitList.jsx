import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { api } from "../utils/api";

function HabitList({ habits, setHabits }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habits;
    return habits.filter(habit =>
      habit.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [habits, searchQuery]);

  const handleCheckbox = async (habitId, currentStatus) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`);

      // Optimistically update or refetch. Let's update local state for simplicity
      setHabits(prev => prev.map(h =>
        h.id === habitId ? { ...h, completedToday: res.completed } : h
      ));

      if (res.completed) toast.success("Habit completed!");
    } catch (err) {
      // Error handled by api wrapper toast
    }
  }

  const showLockedInfo = (habit) => {
    // Basic prerequisite logic preserved, though 'progress' array might not exist 
    // on backend habits yet. Assuming simple list for now.
    // If complex prereqs are needed, backend needs to return them.
    toast.info("Prerequisite info not fully implemented on backend yet.");
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 sm:p-5 shadow-xl h-full flex flex-col min-h-0">
      <h2 className="text-lg sm:text-xl font-semibold text-sky-300 mb-3 sm:mb-4 shrink-0">Your Habits</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
        />
      </div>

      {(!habits || habits.length === 0) ? (
        <p className="text-slate-400">No habits yet. Go add some 🚀</p>) :
        (
          <ul className="space-y-2 sm:space-y-3 overflow-y-auto pr-1 sm:pr-2 flex-1 min-h-0 custom-scrollbar">
            {filteredHabits.length > 0 ? (
              filteredHabits.map((habit) => {
                // Locking logic temporarily disabled until backend supports it fully or we mock it
                const locked = false;
                const completedToday = habit.completedToday;

                return (
                  <li
                    key={habit.id}
                    className="flex items-center justify-between bg-slate-800 rounded-xl p-2 sm:p-3 hover:bg-sky-900/40 hover:scale-[1.01] transition-all duration-300 ease-out border border-transparent hover:border-sky-500/30"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={completedToday}
                        onChange={() => handleCheckbox(habit.id, completedToday)}
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
                      🔥 {habit.currentStreak || 0}
                    </span>
                  </li>
                )
              })
            ) : (
              <p className="text-slate-400 text-center py-4">No habits found matching "{searchQuery}"</p>
            )}
          </ul>
        )}
    </div>
  );
}

export default HabitList