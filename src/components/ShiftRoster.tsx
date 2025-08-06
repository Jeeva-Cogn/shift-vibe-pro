import React, { useMemo } from 'react';
import clsx from 'clsx';

// Team members and shift leads
const shiftLeads = [
  'Jeyakaran',
  'Karthikeyan',
  'Manoj',
  'Panner',
  'SaiKumar',
];
const associates = [
  'Sai Krishna',
  'Jeeva',
  'Saran',
  'Akshay',
  'Murugan',
  'Sahana P',
  'Rengadurai',
];
const excluded = ['Dinesh', 'Mano'];
const allMembers = [...shiftLeads, ...associates];

// Shift definitions
const shifts = [
  { key: 'S1', label: '06:00 AM - 04:00 PM' },
  { key: 'S2', label: '01:00 PM - 11:00 PM' },
  { key: 'S3', label: '10:00 PM - 08:00 AM' },
];

// Helper to get days in August 2025
function getAugust2025Days() {
  const days = [];
  for (let d = 1; d <= 31; d++) {
    const date = new Date(2025, 7, d); // August is month 7 (0-indexed)
    days.push({
      date,
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      label: `${d < 10 ? '0' : ''}${d}-Aug-25`,
    });
  }
  return days;
}

// Basic schedule generator (expandable for full rules)
function generateSchedule() {
  const days = getAugust2025Days();
  const schedule = {};
  days.forEach(({ date, day, label }) => {
    schedule[label] = {};
    shifts.forEach((shift, idx) => {
      // Sunday: only S2 & S3
      if (day === 'Sunday' && shift.key === 'S1') return;
      // Members per shift
      let members = [];
      // Always include one shift lead
      const lead = shiftLeads[(idx + date.getDate()) % shiftLeads.length];
      members.push(lead);
      // Add associates
      let needed =
        day === 'Sunday' ? 2 : day === 'Saturday' ? 2 : shift.key === 'S2' ? 2 : 3;
      while (members.length < needed) {
        const next = associates[(members.length + date.getDate() + idx) % associates.length];
        if (!members.includes(next)) members.push(next);
      }
      schedule[label][shift.key] = members;
    });
  });
  return schedule;
}

export default function ShiftRoster() {
  const schedule = useMemo(() => generateSchedule(), []);
  const days = Object.keys(schedule);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">August 2025 Shift Roster</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Date</th>
              {shifts.map((s) => (
                <th key={s.key} className="border px-2 py-1">{s.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border px-2 py-1 font-semibold">{day}</td>
                {shifts.map((s) => (
                  <td key={s.key} className="border px-2 py-1">
                    {schedule[day][s.key]
                      ? schedule[day][s.key].map((m) => (
                          <span
                            key={m}
                            className={clsx(
                              'inline-block rounded px-2 py-1 m-0.5',
                              shiftLeads.includes(m)
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {m}
                          </span>
                        ))
                      : <span className="text-gray-400">-</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
