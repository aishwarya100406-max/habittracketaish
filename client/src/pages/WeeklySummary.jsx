import React from "react";

const WeeklySummary = ({ habits }) => {
    const today = new Date();
    const weekDays = [];

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d.toISOString().split("T")[0]);
    }

    let completed = 0;
    let missed = 0;

    habits.forEach((habit) => {
        weekDays.forEach((day) => {
            if (habit.completedDates.includes(day)) {
                completed++;
            } else {
                missed++;
            }
        });
    });

    return (
        <div style={{ padding: "20px" }}>
            <h2>Weekly Habit Summary</h2>

            <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
                <div style={cardStyle}>
                    <h4>Completed</h4>
                    <p>{completed}</p>
                </div>

                <div style={cardStyle}>
                    <h4>Missed</h4>
                    <p>{missed}</p>
                </div>

                <div style={cardStyle}>
                    <h4>Total</h4>
                    <p>{completed + missed}</p>
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    background: "#f2f2f2",
    padding: "15px",
    borderRadius: "6px",
    width: "120px",
    textAlign: "center"
};

export default WeeklySummary;
