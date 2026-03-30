"use client";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = ["09:00", "10:00", "11:00", "12:00", "02:00", "03:00", "04:00", "05:00"];

const schedule = {
    Mon: ["09:00", "10:00", "11:00", "02:00", "03:00"],
    Tue: ["09:00", "10:00", "11:00", "02:00", "03:00", "04:00"],
    Wed: ["10:00", "11:00", "02:00"],
    Thu: ["09:00", "10:00", "11:00", "02:00", "03:00", "04:00", "05:00"],
    Fri: ["09:00", "10:00", "11:00", "02:00"],
    Sat: ["10:00", "11:00"],
};

const booked = {
    Mon: ["09:00", "10:00"], Tue: ["09:00", "11:00", "03:00"], Wed: ["10:00"],
    Thu: ["09:00", "10:00", "02:00", "03:00"], Fri: ["09:00"], Sat: [],
};

export default function ScheduleWidget() {
    return (
        <div className="doc-glass-card doc-schedule-card">
            <div className="doc-card-header">
                <h3>Weekly Schedule</h3>
                <button className="doc-schedule-edit">Edit Availability</button>
            </div>
            <div className="doc-schedule-grid">
                <div className="doc-schedule-row doc-schedule-header-row">
                    <div className="doc-schedule-label" />
                    {days.map((d) => (
                        <div key={d} className="doc-schedule-day-header">{d}</div>
                    ))}
                </div>
                {hours.map((h) => (
                    <div key={h} className="doc-schedule-row">
                        <div className="doc-schedule-label">{h}</div>
                        {days.map((d) => {
                            const available = schedule[d]?.includes(h);
                            const isBooked = booked[d]?.includes(h);
                            return (
                                <div
                                    key={d + h}
                                    className={`doc-schedule-slot ${isBooked ? "booked" : available ? "available" : "blocked"}`}
                                    title={isBooked ? "Booked" : available ? "Available" : "Blocked"}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="doc-schedule-legend">
                <span><span className="doc-legend-box available" /> Available</span>
                <span><span className="doc-legend-box booked" /> Booked</span>
                <span><span className="doc-legend-box blocked" /> Blocked</span>
            </div>
        </div>
    );
}
