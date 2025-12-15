import React, { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import HabitList from '../components/HabitList'
import Calendar from '../components/Calendar'
import { api } from '../utils/api'

function Dashboard() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await api.get('/habits');
        setHabits(data);
      } catch (err) {
        // Toast handled by api
      }
    }
    fetchHabits();
  }, []);

  return (
    <>
      <Header username="Aditya" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] min-h-0">
        <div className="overflow-y-auto custom-scrollbar">
          <HabitList habits={habits} setHabits={setHabits} />
        </div>
        <div className="overflow-y-auto">
          <Calendar habits={habits} />
        </div>
      </div>
    </>
  );
}
export default Dashboard
