import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Member {
  id: string;
  eshc: string;
  name: string;
  isLead: boolean;
  isShiftLead: boolean;
}

// Function to check scheduling rules
function checkSchedulingRules(schedule: any, member: string, date: Date): {
  consecutiveDays: number;
  isValidSchedule: boolean;
  lastShift?: string;
  lastShiftDate?: Date;
} {
  let consecutiveDays = 0;
  let lastShift: string | undefined;
  let lastShiftDate: Date | undefined;
  
  // Check past 7 days
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(date);
    checkDate.setDate(date.getDate() - i);
    const dateKey = checkDate.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });

    if (schedule[dateKey]) {
      let foundShift = false;
      Object.entries(schedule[dateKey]).forEach(([shift, members]: [string, any]) => {
        if (members && members.includes(member)) {
          foundShift = true;
          if (!lastShift) {
            lastShift = shift;
            lastShiftDate = new Date(checkDate);
          }
        }
      });
      
      if (foundShift) {
        consecutiveDays++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Check if schedule is valid based on rules
  const isValidSchedule = consecutiveDays < 5 && // No more than 5 consecutive days
    (!lastShift || // No previous shift
     (date.getTime() - (lastShiftDate?.getTime() || 0)) >= 24 * 60 * 60 * 1000); // At least 24h between shifts

  return {
    consecutiveDays,
    isValidSchedule,
    lastShift,
    lastShiftDate
  };
}

// Function to export roster to Excel
function exportToExcel(schedule: Record<string, Record<string, string[]>>, year: number, month: number): void {
  const monthLabel = new Date(year, month).toLocaleString('default', { month: 'short' });
  const dates = Object.keys(schedule);
  const workbook = XLSX.utils.book_new();
  
  // Prepare worksheet data
  const worksheetData: any[][] = [
    ['Date/Month/Year', '', '', '', '', ...dates],
    ['CTS', 'ESHC', 'Name', '', '', ...dates.map(date => 
      new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
    )]
  ];

  // Add member rows
  const members = [
    { id: '593300', eshc: 'EH0647', name: 'Dinesh' },
    { id: '560008', eshc: 'EG4208', name: 'Mano' },
    ...shiftLeads.map(name => ({ id: '', eshc: '', name })),
    ...associates.map(name => ({ id: '', eshc: '', name }))
  ];

  members.forEach(member => {
    const row = [member.id, member.eshc, member.name, '', ''];
    dates.forEach(date => {
      const daySchedule = schedule[date];
      let memberShift = 'OFF';
      Object.entries(daySchedule).forEach(([shiftKey, shiftMembers]) => {
        if (shiftMembers && shiftMembers.includes(member.name)) {
          memberShift = shiftKey;
        }
      });
      row.push(memberShift);
    });
    worksheetData.push(row);
  });

  // Calculate and add shift counts
  worksheetData.push([]);
  const counts = { S1: [], S2: [], S3: [] };
  dates.forEach(date => {
    const daySchedule = schedule[date];
    Object.entries(counts).forEach(([shift]) => {
      counts[shift].push(daySchedule[shift]?.length || 0);
    });
  });

  Object.entries(counts).forEach(([shift, values]) => {
    worksheetData.push(['', '', '', '', shift, ...values]);
  });

  // Add empty rows and shift timings
  worksheetData.push([]);
  worksheetData.push([]);

  [
    ['S1', '06:00 AM TO 04:00 PM IST'],
    ['S2', '01:00 PM TO 11:00 PM IST'],
    ['S3', '10:00 PM TO 08:00 AM IST'],
    ['S4', '12:30 PM TO 10:30 PM IST'],
    ['G', '09:00 AM TO 07:00 PM IST'],
    ['P', '06:30 PM TO 04:30 AM IST'],
    ['HIH', '11:30 AM TO 08:30 PM IST']
  ].forEach(row => worksheetData.push(row));

  // Add leads section
  worksheetData.push([]);
  worksheetData.push(['LeadS']);
  worksheetData.push(['593300', 'EH0647', 'Dinesh Anbalagan']);
  worksheetData.push(['560008', 'EG4208', 'Mano']);
  worksheetData.push(['Shift Leads']);
  shiftLeads.forEach(name => {
    worksheetData.push(['', '', name]);
  });

  // Create worksheet and set column widths
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet['!cols'] = [
    { width: 15 }, // CTS
    { width: 10 }, // ESHC
    { width: 20 }, // Name
    { width: 10 }, // Empty
    { width: 10 }, // Empty
    ...Array(31).fill({ width: 12 }) // Dates
  ];

  // Add cell styles
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = { c: col, r: row };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];
      
      if (cell && typeof cell.v === 'string') {
        // Add background colors based on shift
        let cellStyle;
        switch (cell.v) {
          case 'S1':
            cellStyle = { 
              fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { rgb: 'B8E3E9FF' } // Light blue
              } 
            };
            break;
          case 'S2':
            cellStyle = { 
              fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { rgb: 'FFE699FF' } // Light yellow
              } 
            };
            break;
          case 'S3':
            cellStyle = { 
              fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { rgb: 'C5E0B3FF' } // Light green
              } 
            };
            break;
          case 'S4':
            cellStyle = { 
              fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { rgb: 'F4B183FF' } // Orange
              } 
            };
            break;
          case 'OFF':
            cellStyle = { 
              fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { rgb: 'FF9999FF' } // Light red
              } 
            };
            break;
        }
        if (cellStyle) {
          cell.s = cellStyle;
        }
      }
    }
  }

  // Add worksheet to workbook and save
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Shift Roster');
  XLSX.writeFile(workbook, `ShiftRoster_${monthLabel}${year}.xlsx`);
}

// Team members and shift leads
const shiftLeads = [
  'Jeyakaran',
  'Karthikeyan',
  'Manoj',
  'Panner',
  'SaiKumar',
];
const s2OnlyMembers = [
  { id: '593300', eshc: 'EH0647', name: 'Dinesh' },
  { id: '560008', eshc: 'EG4208', name: 'Mano' }
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
const allMembers = [...shiftLeads, ...associates];

// WFO tracking - minimum 3 days office per week per member
interface WorkLocation {
  wfoCount: number;  // Count of WFO days this week
  wfoDays: Set<string>;  // Days marked for WFO
}

// Shift definitions
const shifts = [
  { key: 'S1', label: '06:00 AM - 04:00 PM' },
  { key: 'S2', label: '01:00 PM - 11:00 PM' },
  { key: 'S3', label: '10:00 PM - 08:00 AM' },
];

// Helper to get days in any month/year
function getDaysInMonth(year: number, month: number) {
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
    });
  }
  return days;
}

// Dynamic schedule generator for any month/year
function generateSchedule(year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const schedule = {};
  const memberShiftHistory = new Map(); // Track last shift and consecutive days
  const weekendCount = new Map(); // Track weekend shifts per member
  const weeklyWFO = new Map(); // Track WFO days per week per member
  const currentWeekWFO = new Map(); // Track current week's WFO count

  // Initialize tracking maps
  [...shiftLeads, ...associates].forEach(member => {
    memberShiftHistory.set(member, { 
      lastShift: null, 
      consecutiveDays: 0, 
      lastWorkDay: null,
      needsWeekOff: false,
      lastWeekOff: null
    });
    weekendCount.set(member, 0);
    weeklyWFO.set(member, { wfoCount: 0, wfoDays: new Set() });
  });

  days.forEach(({ date, day, label }) => {
    schedule[label] = {};
    
    // Reset weekly WFO counts on Monday
    if (day === 'Monday') {
      [...shiftLeads, ...associates].forEach(member => {
        weeklyWFO.set(member, { wfoCount: 0, wfoDays: new Set() });
      });
    }

    // Handle shifts
    shifts.forEach((shift, idx) => {
      // Sunday: only S2 & S3
      if (day === 'Sunday' && shift.key === 'S1') return;

      let members = [];
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      
      // First, handle S2 special members (Dinesh and Mano)
      if (shift.key === 'S2') {
        // Add one S2-only member if not on leave
        const availableS2Only = s2OnlyMembers.filter(member => {
          const history = memberShiftHistory.get(member.name);
          return !history || !history.needsWeekOff;
        });
        if (availableS2Only.length > 0) {
          members.push(availableS2Only[0].name);
        }
      }

      // Get available shift leads
      const availableLeads = shiftLeads.filter(lead => {
        const history = memberShiftHistory.get(lead);
        const lastShiftDate = history.lastWorkDay ? new Date(history.lastWorkDay) : null;
        const daysSinceLastShift = lastShiftDate ? 
          Math.floor((date.getTime() - lastShiftDate.getTime()) / (24 * 60 * 60 * 1000)) : 999;
        const weeklyWfoInfo = weeklyWFO.get(lead);
        
        // Check if member needs a week off
        if (history.consecutiveDays >= 6) {
          history.needsWeekOff = true;
        }

        // If on week off, check if enough days have passed
        if (history.needsWeekOff) {
          const daysSinceWeekOff = history.lastWeekOff ? 
            Math.floor((date.getTime() - history.lastWeekOff.getTime()) / (24 * 60 * 60 * 1000)) : 999;
          if (daysSinceWeekOff >= 2) { // At least 2 consecutive days off
            history.needsWeekOff = false;
            history.consecutiveDays = 0;
          } else {
            return false;
          }
        }

        return (
          !history.needsWeekOff &&
          history.consecutiveDays < 6 && // No more than 6 consecutive days
          (!history.lastShift || daysSinceLastShift > 1) && // At least 1 day rest between shifts
          (!isWeekend || weekendCount.get(lead) < 2) && // Max 2 weekend shifts per month
          (weeklyWfoInfo.wfoCount < 3 || weeklyWfoInfo.wfoDays.has(label)) // WFO/WFH compliance
        );
      });

      // Select lead with least weekend shifts if weekend
      const lead = isWeekend ?
        availableLeads.sort((a, b) => weekendCount.get(a) - weekendCount.get(b))[0] :
        availableLeads[(idx + date.getDate()) % availableLeads.length];

      if (lead) {
        members.push(lead);
        const history = memberShiftHistory.get(lead);
        history.consecutiveDays++;
        history.lastShift = shift.key;
        history.lastWorkDay = date;
        if (isWeekend) weekendCount.set(lead, weekendCount.get(lead) + 1);
      }

      // Calculate needed members
      let needed = day === 'Sunday' ? 2 : day === 'Saturday' ? 2 : shift.key === 'S2' ? 2 : 3;

      // Calculate how many members we need in office for this shift
      const currentShiftTotal = schedule[label][shift.key]?.length || 0;
      const officeQuota = Math.min(2, Math.ceil(currentShiftTotal * 0.5)); // At least 50% in office

      // Add available associates
      const availableAssociates = associates.filter(associate => {
        const history = memberShiftHistory.get(associate);
        const lastShiftDate = history.lastWorkDay ? new Date(history.lastWorkDay) : null;
        const daysSinceLastShift = lastShiftDate ?
          Math.floor((date.getTime() - lastShiftDate.getTime()) / (24 * 60 * 60 * 1000)) : 999;
        const weeklyWfoInfo = weeklyWFO.get(associate);

        // Check if member needs a week off
        if (history.consecutiveDays >= 6) {
          history.needsWeekOff = true;
        }

        // If on week off, check if enough days have passed
        if (history.needsWeekOff) {
          const daysSinceWeekOff = history.lastWeekOff ? 
            Math.floor((date.getTime() - history.lastWeekOff.getTime()) / (24 * 60 * 60 * 1000)) : 999;
          if (daysSinceWeekOff >= 2) { // At least 2 consecutive days off
            history.needsWeekOff = false;
            history.consecutiveDays = 0;
          } else {
            return false;
          }
        }

        return (
          !members.includes(associate) &&
          !history.needsWeekOff &&
          history.consecutiveDays < 6 && // Max 6 consecutive days
          (!history.lastShift || daysSinceLastShift > 1) && // At least 1 day rest between shifts
          (!isWeekend || weekendCount.get(associate) < 2) && // Max 2 weekend shifts per month
          (weeklyWfoInfo.wfoCount < 3 || weeklyWfoInfo.wfoDays.has(label)) // WFO/WFH compliance
        );
      });

      // Count current WFO members in this shift
      let wfoCount = members.filter(m => weeklyWFO.get(m)?.wfoDays.has(label)).length;

      while (members.length < needed && availableAssociates.length > 0) {
        // Sort associates by WFO priority (need to meet 3-day quota)
        const sortedAssociates = [...availableAssociates].sort((a, b) => {
          const aWfo = weeklyWFO.get(a);
          const bWfo = weeklyWFO.get(b);
          // Prioritize those who need more WFO days
          return (aWfo?.wfoCount || 0) - (bWfo?.wfoCount || 0);
        });

        const associate = sortedAssociates[0];
        availableAssociates.splice(availableAssociates.indexOf(associate), 1);

        members.push(associate);
        const history = memberShiftHistory.get(associate);
        history.consecutiveDays++;
        history.lastShift = shift.key;
        history.lastWorkDay = date;
        
        // Handle WFO assignment
        const wfoInfo = weeklyWFO.get(associate);
        if (wfoCount < officeQuota && wfoInfo.wfoCount < 3) {
          wfoInfo.wfoCount++;
          wfoInfo.wfoDays.add(label);
          wfoCount++;
        }

        if (isWeekend) weekendCount.set(associate, weekendCount.get(associate) + 1);
      }

      schedule[label][shift.key] = members;
    });
  });
  return schedule;
}

export default function ShiftRoster() {
  // Default to August 2025
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(7); // August (0-indexed)
  const schedule = useMemo(() => generateSchedule(year, month), [year, month]);
  const days = Object.keys(schedule);

  // Month options
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold">Shift Roster</h2>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <label className="font-medium">Month:</label>
            <select
              className="border rounded px-2 py-1"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            <label className="font-medium">Year:</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20"
              value={year}
              min={2020}
              max={2100}
              onChange={e => setYear(Number(e.target.value))}
            />
          </div>
          <button
            onClick={() => exportToExcel(schedule, year, month)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors"
          >
            <FileDown className="h-4 w-4" />
            Export to Excel
          </button>
        </div>
      </div>
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
