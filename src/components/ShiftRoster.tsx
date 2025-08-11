import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FileDown } from 'lucide-react';
import ExcelJS from 'exceljs';
import { addExportRecord } from '@/lib/exportHistory';

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

// Function to export roster to Excel (ExcelJS with colors) and store in Reports
async function exportToExcel(schedule: Record<string, Record<string, string[]>>, year: number, month: number): Promise<void> {
  const monthLabel = new Date(year, month).toLocaleString('default', { month: 'long' });
  const dates = Object.keys(schedule);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Shift Roster');

  // Header rows
  const headerRow1 = ['CTS', 'ESHC', 'Name', '', '', ...dates];
  const headerRow2 = ['', '', '', '', '', ...dates.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'long' }))];
  worksheet.addRow(headerRow1);
  worksheet.addRow(headerRow2);

  // Column widths
  const widths = [15, 10, 20, 10, 10, ...Array(31).fill(12)];
  widths.forEach((w, i) => (worksheet.getColumn(i + 1).width = w));

  // Members
  const members = [
    { id: '593300', eshc: 'EH0647', name: 'Dinesh' },
    { id: '560008', eshc: 'EG4208', name: 'Mano' },
    ...shiftLeads.map(name => ({ id: '', eshc: '', name })),
    ...associates.map(name => ({ id: '', eshc: '', name })),
  ];

  // Colors (ARGB)
  const fillForValue = (val: string | undefined) => {
    switch (val) {
      case 'S1': return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB8E3E9' } }; // light blue
      case 'S2': return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } }; // light yellow
      case 'S3': return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5E0B3' } }; // light green
      case 'S4': return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4B183' } }; // orange
      case 'OFF': return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; // grey
      case 'LEAVE': return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }; // light grey
      default: return undefined;
    }
  };

  // Fill member rows
  for (const member of members) {
    const rowValues: any[] = [member.id, member.eshc, member.name, '', ''];
    const row = worksheet.addRow(rowValues);
    // Later we'll fill date cells
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const daySchedule = schedule[date];
      let memberShift = 'OFF';
      for (const [shiftKey, shiftMembers] of Object.entries(daySchedule)) {
        if (shiftMembers && shiftMembers.includes(member.name)) {
          memberShift = shiftKey;
          break;
        }
      }
      const cell = row.getCell(6 + i); // first 5 columns reserved
      cell.value = memberShift;
      const fill = fillForValue(memberShift);
      if (fill) cell.fill = fill as any;
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin', color: { argb: 'FFEEEEEE' } }, left: { style: 'thin', color: { argb: 'FFEEEEEE' } }, bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } }, right: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    }
  }

  // Empty row
  worksheet.addRow([]);

  // Shift counts per day
  const countsRowStart = worksheet.rowCount + 1;
  const shiftsList: Array<'S1'|'S2'|'S3'> = ['S1','S2','S3'];
  for (const s of shiftsList) {
    const row = worksheet.addRow(['', '', '', '', s, ...dates.map(date => schedule[date][s]?.length || 0)]);
    // Style shift label cell
    const labelCell = row.getCell(5);
    const fill = fillForValue(s);
    if (fill) labelCell.fill = fill as any;
    labelCell.font = { bold: true };
  }

  // Legend and timings
  worksheet.addRow([]);
  worksheet.addRow([]);
  const timings = [
    ['S1', '06:00 AM TO 04:00 PM IST'],
    ['S2', '01:00 PM TO 11:00 PM IST'],
    ['S3', '10:00 PM TO 08:00 AM IST'],
    ['S4', '12:30 PM TO 10:30 PM IST'],
    ['G', '09:00 AM TO 07:00 PM IST'],
    ['P', '06:30 PM TO 04:30 AM IST'],
    ['HIH', '11:30 AM TO 08:30 PM IST'],
  ];
  for (const [code, text] of timings) {
    const r = worksheet.addRow([code, text]);
    const cell = r.getCell(1);
    const fill = fillForValue(code);
    if (fill) cell.fill = fill as any;
    cell.font = { bold: true };
  }

  // Leads section
  worksheet.addRow([]);
  worksheet.addRow(['Leads']);
  worksheet.addRow(['593300', 'EH0647', 'Dinesh Anbalagan']);
  worksheet.addRow(['560008', 'EG4208', 'Mano']);
  worksheet.addRow(['Shift Leads']);
  for (const name of shiftLeads) worksheet.addRow(['', '', name]);

  // Borders for header rows
  [1,2].forEach(rn => {
    const r = worksheet.getRow(rn);
    r.eachCell(c => { c.font = { bold: rn === 1 }; c.alignment = { horizontal: 'center' }; });
  });

  // Write and download
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `ShiftRoster_${monthLabel}${year}.xlsx`;

  // Save to export history
  addExportRecord(filename, monthLabel, String(year), buffer);

  // Download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
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
