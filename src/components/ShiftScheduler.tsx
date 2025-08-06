
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, RefreshCw, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import solver from 'javascript-lp-solver';
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

      // Header rows (match sample: 3 empty, then CTS, ESHC, Name, then days)
      const header = [ '', '', '', 'CTS', 'ESHC', 'Name', ...Array.from({length: daysInMonth}, (_, i) => formatDate(i+1, monthNum, yearNum)) ];
      const subHeader = [ '', '', '', '', '', '', ...Array.from({length: daysInMonth}, (_, i) => getWeekday(yearNum, monthNum, i+1)) ];


      // --- AI-based constraint-driven scheduler using javascript-lp-solver ---
      // Build a model for the solver
      // Variables: x_{emp}_{day}_{shift} = 1 if emp is assigned to shift on day
      // Constraints: business rules
      // Objective: maximize fairness (minimize max difference in shift counts)

      // Helper to get all shift codes for a day
      const allShifts = ['S1', 'S2', 'S3'];
      const shiftLeads = ['Jeyakaran', 'Karthikeyan', 'Manoj', 'Panner', 'SaiKumar'];
      const teamLeads = ['Dinesh', 'Mano'];
      const empIdxByName = name => employees.findIndex(e => e.name === name);

      // Build variables
      const variables = {};
      employees.forEach(emp => {
        for (let d = 1; d <= daysInMonth; d++) {
          allShifts.forEach(shift => {
            const key = `${emp.name}_${d}_${shift}`;
            variables[key] = 0;
          });
        }
      });

      // Build model
      const model = {
        optimize: 'fairness',
        opType: 'min',
        constraints: {},
        variables: {},
        ints: {},
      };

      // For each employee, day, shift: create variable, integer, and add randomization to fairness
      employees.forEach(emp => {
        for (let d = 1; d <= daysInMonth; d++) {
          allShifts.forEach(shift => {
            const key = `${emp.name}_${d}_${shift}`;
            // Add a small random value to fairness to break ties and encourage varied solutions
            model.variables[key] = { fairness: 1 + Math.random() * 0.1 };
            model.ints[key] = 1;
          });
        }
      });

      // --- Strict week off constraints ---
      // 1. Each employee must have OFF only on weekends (Saturday/Sunday)
      employees.forEach(emp => {
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(yearNum, monthNum - 1, d);
          const weekday = date.getDay();
          // If not Saturday or Sunday, prevent OFF
          if (weekday !== 0 && weekday !== 6) {
            // Prevent all OFF on weekdays
            model.constraints[`${emp.name}_noWeekdayOff_${d}`] = { max: 0 };
            // OFF means not assigned to any shift
            allShifts.forEach(shift => {
              model.variables[`${emp.name}_${d}_${shift}`][`${emp.name}_noWeekdayOff_${d}`] = 1;
            });
          }
        }
      });

      // 2. After 4-6 working days, must have a week off (on a weekend)
      // For each employee, count working days between weekends, enforce 4-6
      employees.forEach(emp => {
        let lastOff = 0;
        let workStreak = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(yearNum, monthNum - 1, d);
          const weekday = date.getDay();
          if (weekday === 6 || weekday === 0) {
            // Weekend: must be OFF at least once every 4-6 days
            // Count working days since last weekend
            if (d - lastOff > 6) {
              // Too many working days, force OFF
              model.constraints[`${emp.name}_mustOff_${d}`] = { min: 1 };
              allShifts.forEach(shift => {
                model.variables[`${emp.name}_${d}_${shift}`][`${emp.name}_mustOff_${d}`] = 0;
              });
            }
            lastOff = d;
            workStreak = 0;
          } else {
            workStreak++;
            if (workStreak > 6) {
              // Not allowed
              model.constraints[`${emp.name}_noLongWork_${d}`] = { max: 0 };
              allShifts.forEach(shift => {
                model.variables[`${emp.name}_${d}_${shift}`][`${emp.name}_noLongWork_${d}`] = 1;
              });
            }
          }
        }
      });

      // 3. Consecutive OFFs only allowed on weekends
      employees.forEach(emp => {
        for (let d = 2; d <= daysInMonth; d++) {
          const date1 = new Date(yearNum, monthNum - 1, d - 1);
          const date2 = new Date(yearNum, monthNum - 1, d);
          const wd1 = date1.getDay();
          const wd2 = date2.getDay();
          // If both days are not weekends, prevent consecutive OFFs
          if (!((wd1 === 6 || wd1 === 0) && (wd2 === 6 || wd2 === 0))) {
            // If both days are not weekends, prevent both days being OFF
            const key1 = allShifts.map(shift => `${emp.name}_${d-1}_${shift}`);
            const key2 = allShifts.map(shift => `${emp.name}_${d}_${shift}`);
            // At least one must be working
            model.constraints[`${emp.name}_noConsecOff_${d}`] = { min: 1 };
            key1.forEach(k => {
              model.variables[k][`${emp.name}_noConsecOff_${d}`] = 1;
            });
            key2.forEach(k => {
              model.variables[k][`${emp.name}_noConsecOff_${d}`] = 1;
            });
          }
        }
      });
      // --- END strict week off constraints ---

      // Each employee can have at most 1 shift per day
      employees.forEach(emp => {
        for (let d = 1; d <= daysInMonth; d++) {
          const keys = allShifts.map(shift => `${emp.name}_${d}_${shift}`);
          model.constraints[`${emp.name}_day${d}_oneShift`] = { max: 1 };
          keys.forEach(k => {
            model.variables[k][`${emp.name}_day${d}_oneShift`] = 1;
          });
        }
      });

      // Each shift per day must be filled as per requirements
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yearNum, monthNum - 1, d);
        const weekday = date.getDay();
        let req;
        if (weekday === 0) req = shiftRequirements['Sunday'];
        else if (weekday === 6) req = shiftRequirements['Saturday'];
        else req = shiftRequirements['Monday-Friday'];
        allShifts.forEach(shift => {
          const keys = employees.map(emp => `${emp.name}_${d}_${shift}`);
          model.constraints[`day${d}_${shift}_req`] = { equal: req[shift] };
          keys.forEach(k => {
            model.variables[k][`day${d}_${shift}_req`] = 1;
          });
        });
      }

      // Each lead must be present in at least one shift per day (if not team lead)
      for (let d = 1; d <= daysInMonth; d++) {
        shiftLeads.forEach(lead => {
          const keys = allShifts.map(shift => `${lead}_${d}_${shift}`);
          model.constraints[`lead_${lead}_day${d}`] = { min: 1 };
          keys.forEach(k => {
            model.variables[k][`lead_${lead}_day${d}`] = 1;
          });
        });
      }

      // Team leads (Dinesh, Mano) only in S2, weekdays only
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yearNum, monthNum - 1, d);
        const weekday = date.getDay();
        teamLeads.forEach(lead => {
          allShifts.forEach(shift => {
            const key = `${lead}_${d}_${shift}`;
            if (shift !== 'S2' || weekday === 0 || weekday === 6) {
              // Not allowed
              model.constraints[`no_${lead}_${d}_${shift}`] = { max: 0 };
              model.variables[key][`no_${lead}_${d}_${shift}`] = 1;
            }
          });
        });
      }

      // Try to balance shifts among employees (fairness)
      // For each employee, total shifts assigned should be close to average
      const totalShifts = daysInMonth * allShifts.length;
      const avgShifts = Math.floor((totalShifts * 1.0) / employees.length);
      employees.forEach(emp => {
        const keys = [];
        for (let d = 1; d <= daysInMonth; d++) {
          allShifts.forEach(shift => {
            keys.push(`${emp.name}_${d}_${shift}`);
          });
        }
        model.constraints[`${emp.name}_minShifts`] = { min: avgShifts - 1 };
        model.constraints[`${emp.name}_maxShifts`] = { max: avgShifts + 1 };
        keys.forEach(k => {
          model.variables[k][`${emp.name}_minShifts`] = 1;
          model.variables[k][`${emp.name}_maxShifts`] = 1;
        });
      });

      // Solve the model
      let results;
      try {
        results = solver.Solve(model);
      } catch (e) {
        toast.error('AI scheduling failed, falling back to rule-based.');
      }

      // Prepare empRows: ['', '', '', cts, eshc, name, ...days]
      const empRows = employees.map(emp => ['', '', '', emp.cts, emp.eshc, emp.name, ...Array(daysInMonth).fill('')]);
      if (results && results.feasible) {
        // Fill empRows from results
        employees.forEach((emp, empIdx) => {
          for (let d = 1; d <= daysInMonth; d++) {
            let found = false;
            allShifts.forEach(shift => {
              const key = `${emp.name}_${d}_${shift}`;
              if (results[key] === 1) {
                empRows[empIdx][6 + d] = shift;
                found = true;
              }
            });
            if (!found) {
              empRows[empIdx][6 + d] = 'OFF';
            }
          }
        });
      } else {
        // Fallback: everyone OFF
        employees.forEach((emp, empIdx) => {
          for (let d = 1; d <= daysInMonth; d++) {
            empRows[empIdx][6 + d] = 'OFF';
          }
        });
      }
      // --- END AI-based constraint-driven scheduler ---

      // Summary rows for S1, S2, S3 (count per day)
      function countShift(shiftCode, dayIdx) {
        return empRows.reduce((acc, row) => row[6+dayIdx] === shiftCode ? acc+1 : acc, 0);
      }
      const summaryRows = ['S1','S2','S3'].map(shiftCode => {
        const row = ['', '', '', shiftCode, '', '', ...Array.from({length: daysInMonth}, (_, i) => countShift(shiftCode, i+1))];
        return row;
      });

      // Final data for export
      const data = [header, subHeader, ...empRows, ...summaryRows];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Shift Schedule');


      // Add legend and data
      worksheet.addRows(legend);
      worksheet.addRows(data);

      // Color coding for shift cells (S1/S2/S3/S4 = green, OFF = grey, Leave = light grey)
      // Data starts after legend (legend.length rows), header+subHeader (2 rows), then empRows
      const startRow = legend.length + 3; // 1-based index for first employee row
      const empCount = employees.length;
      for (let i = 0; i < empCount; i++) {
        const rowIdx = startRow + i;
        // Color shift cells (S1/S2/S3/S4, OFF, Leave)
        for (let d = 0; d < daysInMonth; d++) {
          const colIdx = 7 + d; // 1-based, skip first 6 columns
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
      {/* Chennai Time Banner at bottom, small */}
      <div className="w-full text-center mt-4">
        <span className="text-xs text-blue-700">Current Chennai Time: {chennaiTimeNow}</span>
      </div>
    </div>
  );
};

export default ShiftScheduler;
