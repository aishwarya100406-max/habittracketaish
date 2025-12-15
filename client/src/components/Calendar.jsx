// client/src/components/Calendar.jsx
import React, { useState } from "react";
import {isHabitDue, isPrerequisitesMet} from "../utils/utils"
function Calendar({habits}) {

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - Jan
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 - sunday

  const daysInMonth = Array.from({length: lastDay}, (_, i) => i + 1);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = Array(firstDayOfWeek).fill(null).concat(daysInMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 sm:p-5 shadow-xl h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button className="p-1.5 sm:p-2 rounded-full hover:bg-slate-800 transition" onClick={prevMonth}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-semibold text-sky-300">Streaks</h2>
          <p className="text-xs sm:text-sm text-slate-400">{months[month]} {year}</p>
        </div>
        <button className="p-1.5 sm:p-2 rounded-full hover:bg-slate-800 transition" onClick={nextMonth}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm mb-2 sm:mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-slate-400 font-medium">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-3 text-center text-xs sm:text-sm flex-1 min-h-0 overflow-visible custom-scrollbar">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="aspect-square" />;

          const dayDate = new Date(year, month, day);
          const dueHabits = habits.filter(h => isHabitDue(h, dayDate));
          const eligible = dueHabits.filter(h => isPrerequisitesMet(h, habits, dayDate));
          const locked = dueHabits.filter(h => !isPrerequisitesMet(h, habits, dayDate));
          const completedHabits = eligible.filter(h => h.progress.includes(dayDate.toISOString().split("T")[0]));
          const completion = eligible.length === 0 ? null : completedHabits.length / eligible.length;

          let bgColor = "";
          if (completion === null) bgColor = ""
          else if (completion === 0) bgColor = "#AA4A44";
          else if (completion > 0 && completion <= 0.25) bgColor = "#d6f5d6";
          else if (completion <= 0.75) bgColor = "#7cd67c";
          else if (completion > 0.75) bgColor = "#2eb82e";
          
          return (
            <div
              key={index}
              className="aspect-square flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 hover:border-sky-400/60 hover:bg-sky-900/30 transition-all duration-200 group relative cursor-pointer"
              style={{backgroundColor: bgColor }}
            >
              <span className="text-slate-200">{day}</span>
              <div className="absolute bottom-full mb-1 sm:mb-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs bg-slate-800 text-slate-200 shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {eligible.length === 0 ? "No eligible habits" :
                  `🔥 ${completedHabits.length}/${eligible.length} done!`
                }
                {locked.length > 0 && <span className="block text-xs text-slate-400">• {locked.length} locked</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;