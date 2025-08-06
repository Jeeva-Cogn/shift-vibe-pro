
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, RefreshCw, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { getChennaiTime, getChennaiTimeString } from '@/lib/utils';

const ShiftScheduler = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chennaiTimeNow, setChennaiTimeNow] = useState(getChennaiTimeString());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setChennaiTimeNow(getChennaiTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i - 2;
    return { value: year.toString(), label: year.toString() };
  });

  const shiftRequirements = {
    'Monday-Friday': {
      S1: 3,
      S2: 2,
      S3: 3
    },
    'Saturday': {
      S1: 2,
      S2: 2,
      S3: 2
    },
    'Sunday': {
      S1: 0,
      S2: 2,
      S3: 2
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const chennaiTime = getChennaiTimeString();
      toast.success('Schedule generated successfully!', {
        description: `Generated for ${months.find(m => m.value === selectedMonth.split('-')[1])?.label} ${selectedYear} (Chennai time: ${chennaiTime})`
      });
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const monthName = months.find(m => m.value === selectedMonth.split('-')[1])?.label;
      const chennaiTime = getChennaiTimeString();
      const filename = `Shift_Schedule_${monthName}_${selectedYear}.xlsx`;

      // Sample data
      const legend = [
        ['Legend:', 'WFO = Green', 'WFH = Cyan', 'OFF = Grey', 'LEAVE = Light Grey'],
        [`Exported at: ${chennaiTime} (Chennai time)`]
      ];
      // Team data (IDs, codes, names)
      const employees = [
        { cts: '593300', eshc: 'EH0647', name: 'Dinesh' },
        { cts: '560008', eshc: 'EG4208', name: 'Mano' },
        { cts: '410093', eshc: 'EH6832', name: 'Jeyakaran' },
        { cts: '2167353', eshc: 'C7H8KH', name: 'Karthikeyan' },
        { cts: '2136623', eshc: 'C8G3CW', name: 'Manoj' },
        { cts: '2054459', eshc: 'C6X8FS', name: 'Panner' },
        { cts: '2240608', eshc: 'C7T7SF', name: 'SaiKumar' },
        { cts: '2054433', eshc: 'C6X7K5', name: 'Sai Krishna' },
        { cts: '2299004', eshc: 'C8N5H4', name: 'Jeeva' },
        { cts: '2309236', eshc: 'C8S7B6', name: 'Saran' },
        { cts: '2328010', eshc: 'C8W2BD', name: 'Akshay' },
        { cts: '2378392', eshc: 'C9B7ZT', name: 'Murugan' },
        { cts: '2411200', eshc: 'C9G7D2', name: 'Sahana P' },
        { cts: '2389541', eshc: 'C9H4JZ', name: 'Rengadurai' },
      ];

      // Helper to get days in month
      function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
      }
      // Helper to get weekday name
      function getWeekday(year, month, day) {
        return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(year, month-1, day).getDay()];
      }
      // Helper to format date as '01-Aug-25'
      function formatDate(day, month, year) {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return `${String(day).padStart(2,'0')}-${monthNames[month - 1]}-${String(year).slice(-2)}`;
      }

      const yearNum = parseInt(selectedYear, 10);
      const monthNum = parseInt(selectedMonth.split('-')[1], 10);
      const daysInMonth = getDaysInMonth(yearNum, monthNum);

      // Header rows
      const header1 = ['Date/Month/Year', '', '', ...Array.from({length: daysInMonth}, (_, i) => formatDate(i+1, monthNum, yearNum))];
      const header2 = ['', 'CTS', 'ESHC', 'Name', ...Array.from({length: daysInMonth}, (_, i) => getWeekday(yearNum, monthNum, i+1))];

      // --- Staged assignment: leads first, then associates ---
      // Define shift leads and team leads
      const shiftLeads = ['Jeyakaran', 'Karthikeyan', 'Manoj', 'Panner', 'SaiKumar'];
      const teamLeads = ['Dinesh', 'Mano'];
      // For each day, assign shifts according to requirements
      const empRows = employees.map(emp => ['', emp.cts, emp.eshc, emp.name, ...Array(daysInMonth).fill('')]);
      // Helper to get employee index by name
      const empIdxByName = name => employees.findIndex(e => e.name === name);
      // For each day, assign shifts
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(yearNum, monthNum - 1, day);
        const weekday = date.getDay();
        let req;
        if (weekday === 0) req = shiftRequirements['Sunday'];
        else if (weekday === 6) req = shiftRequirements['Saturday'];
        else req = shiftRequirements['Monday-Friday'];
        // Track assigned
        const assigned = { S1: [], S2: [], S3: [] };
        // 1. Place shift leads first
        let availableLeads = shiftLeads.slice();
        // Shuffle for fairness
        availableLeads = availableLeads.sort(() => Math.random() - 0.5);
        // Place one lead per shift
        ['S1','S2','S3'].forEach((shift, i) => {
          if (req[shift] > 0 && availableLeads.length > 0) {
            const lead = availableLeads.shift();
            const idx = empIdxByName(lead);
            if (idx !== -1) {
              empRows[idx][3 + day] = shift;
              assigned[shift].push(idx);
            }
          }
        });
        // 2. Place team leads (Dinesh, Mano) in S2 only, weekends off
        teamLeads.forEach(lead => {
          const idx = empIdxByName(lead);
          if (idx !== -1) {
            if (weekday !== 0 && weekday !== 6 && req['S2'] > assigned['S2'].length) {
              empRows[idx][3 + day] = 'S2';
              assigned['S2'].push(idx);
            } else {
              empRows[idx][3 + day] = 'OFF';
            }
          }
        });
        // 3. Fill remaining slots with associates
        ['S1','S2','S3'].forEach(shift => {
          let needed = req[shift] - assigned[shift].length;
          if (needed > 0) {
            for (let i = 0; i < employees.length && needed > 0; i++) {
              if (empRows[i][3 + day] === '') {
                empRows[i][3 + day] = shift;
                assigned[shift].push(i);
                needed--;
              }
            }
          }
        });
        // 4. All others OFF
        for (let i = 0; i < employees.length; i++) {
          if (empRows[i][3 + day] === '') empRows[i][3 + day] = 'OFF';
        }
      }

      // Summary rows for S1, S2, S3 (count per day)
      function countShift(shiftCode, dayIdx) {
        return empRows.reduce((acc, row) => row[4+dayIdx] === shiftCode ? acc+1 : acc, 0);
      }
      const summaryRows = ['S1','S2','S3'].map(shiftCode => {
        const row = [shiftCode, ...Array(3).fill(''), ...Array.from({length: daysInMonth}, (_, i) => countShift(shiftCode, i))];
        return row;
      });

      // Final data for export
      const data = [header1, header2, ...empRows, ...summaryRows];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Shift Schedule');


      // Add legend and data
      worksheet.addRows(legend);
      worksheet.addRows(data);

      // Color coding for shift cells (S1/S2/S3/S4 = green, OFF = grey, Leave = light grey)
      // Data starts after legend (legend.length rows), header1+header2 (2 rows), then empRows
      const startRow = legend.length + 3; // 1-based index for first employee row
      const empCount = employees.length;
      for (let i = 0; i < empCount; i++) {
        const rowIdx = startRow + i;
        for (let d = 0; d < daysInMonth; d++) {
          const colIdx = 5 + d; // 1-based, skip first 4 columns
          const cell = worksheet.getRow(rowIdx).getCell(colIdx);
          switch (cell.value) {
            case 'S1':
            case 'S2':
            case 'S3':
            case 'S4':
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6F6D5' } }; // green
              break;
            case 'OFF':
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } }; // grey
              break;
            case 'Leave':
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } }; // light grey
              break;
            default:
              break;
          }
        }
      }

      // Set column widths
      worksheet.columns = [
        { width: 20 }, // Employee
        { width: 12 }, // Date
        { width: 8 },  // Shift
        { width: 8 },  // Type
        { width: 8 }   // Seat
      ];

      // Color coding for 'Type' column
      for (let i = legend.length + 2; i < worksheet.rowCount + 1; i++) {
        const typeCell = worksheet.getCell(`D${i}`);
        switch (typeCell.value) {
          case 'WFO':
            typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6F6D5' } };
            break;
          case 'WFH':
            typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A7F3D0' } };
            break;
          case 'OFF':
            typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
            break;
          case 'LEAVE':
            typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };
            break;
        }
      }

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Export completed!', { description: `Downloaded: ${filename}` });
    } catch (error) {
      toast.error('Failed to export schedule');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chennai Time Banner */}
      <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-semibold rounded">
        Current Chennai Time: {chennaiTimeNow}
      </div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Month</label>
              <Select value={selectedMonth.split('-')[1]} onValueChange={(month) => setSelectedMonth(`${selectedYear}-${month}`)}>
                <SelectTrigger className="w-[150px] transition-all duration-200 hover:scale-105">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Select Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] transition-all duration-200 hover:scale-105">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateSchedule} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={isExporting}
            className="transition-all duration-200 hover:scale-105"
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Shift Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(shiftRequirements).map(([day, shifts]) => (
          <Card key={day} className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(shifts).map(([shift, count]) => (
                  <div key={shift} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{shift}</span>
                    <Badge variant={count > 0 ? "default" : "secondary"}>
                      {count > 0 ? `${count} members` : 'No shift'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rules Summary */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduling Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Lead Requirements</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• One of the 3 leads must be in every shift</li>
                <li>• Leads: Jeyakaran, Karthikeyan, Manoj, Panner, SaiKumar</li>
                <li>• Dinesh and Mano are Team Leads (S2 only, weekends off)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Shift Patterns</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Mon-Fri: S1(3), S2(2), S3(3)</li>
                <li>• Saturday: S1(2), S2(2), S3(2)</li>
                <li>• Sunday: S2(2), S3(2) only</li>
                <li>• Week off after 4-6 working days</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">Office Requirements</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Max 8 seats available</li>
                <li>• 3 consecutive days WFO, 2 days WFH</li>
                <li>• At least 2 members in office per shift</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">Leave Management</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Consecutive week offs allowed</li>
                <li>• Week offs limited to monthly weekends</li>
                <li>• Leave management integrated with calendar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftScheduler;
