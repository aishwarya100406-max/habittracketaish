import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import Header from '../components/layout/Header';
import { Link } from 'react-router-dom';

const WeeklySummary = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/summary');
                setStats(data);
            } catch (err) {
                // Error handled by api wrapper
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading summary...</div>;

    return (
        <>
            <Header />
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-sky-400">Weekly Summary</h2>
                    <Link to="/" className="text-sm text-slate-400 hover:text-white transition">Back to Dashboard</Link>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
                    <div className="grid grid-cols-7 gap-2 h-40 items-end mb-4">
                        {stats.map((day) => (
                            <div key={day.date} className="flex flex-col items-center gap-2 group">
                                <div className="w-full relative flex-1 flex items-end bg-slate-800 rounded-lg overflow-hidden tool">
                                    <div
                                        style={{ height: `${day.progress}%` }}
                                        className="w-full bg-sky-500 transition-all duration-500 hover:bg-sky-400"
                                    ></div>
                                </div>
                                <span className="text-xs text-slate-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                {/* Tooltip-like details on hover could go here, or just simple text */}
                                <div className="text-xs font-bold text-white">{day.completed}/{day.total}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-slate-500 text-sm">Habit completion rates for the last 7 days</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-transparent hover:border-sky-500/30 transition">
                        <h3 className="text-slate-400 text-sm font-medium">Total Completed</h3>
                        <p className="text-3xl font-bold text-white mt-1">
                            {stats.reduce((acc, curr) => acc + curr.completed, 0)}
                        </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-transparent hover:border-sky-500/30 transition">
                        <h3 className="text-slate-400 text-sm font-medium">Avg. Completion</h3>
                        <p className="text-3xl font-bold text-sky-400 mt-1">
                            {stats.length > 0 ? Math.round(stats.reduce((acc, curr) => acc + curr.progress, 0) / stats.length) : 0}%
                        </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-transparent hover:border-sky-500/30 transition">
                        <h3 className="text-slate-400 text-sm font-medium">Best Day</h3>
                        <p className="text-3xl font-bold text-green-400 mt-1">
                            {stats.reduce((prev, current) => (prev.completed > current.completed) ? prev : current, { completed: 0 }).completed > 0
                                ? new Date(stats.reduce((prev, current) => (prev.completed > current.completed) ? prev : current).date).toLocaleDateString('en-US', { weekday: 'long' })
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WeeklySummary;
