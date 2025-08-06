import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { getChennaiTimeString } from '@/lib/utils';

const ShiftScheduler = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isExporting, setIsExporting] = useState(false);

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

  // Fetch schedule data from backend API that applies all business rules
  const fetchScheduleData = async (year: string, month: string) => {
    try {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const res = await fetch('/.netlify/functions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: yearNum, month: monthNum })
      });
      if (!res.ok) {
        toast.error('Failed to fetch schedule');
        return null;
      }
      const data = await res.json();
      if (!data || typeof data !== 'object' || !data.results || typeof data.results !== 'object') {
        toast.error('Invalid schedule data format');
        return null;
      }
      return data.results;
    } catch (error: any) {
      toast.error('Failed to fetch schedule', { description: error.message || undefined });
      return null;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const monthName = months.find(m => m.value === selectedMonth.split('-')[1])?.label;
      const filename = `Shift_Schedule_${monthName}_${selectedYear}.xlsx`;

      // Fetch schedule data
      const year = selectedYear;
      const month = selectedMonth.split('-')[1];
      const scheduleData = await fetchScheduleData(year, month);

      // Always export, even if no data, but show a warning
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Schedule');
      worksheet.addRow(['Employee', 'Day', 'Shift']);

      let addedRows = 0;
      if (scheduleData) {
        for (const key in scheduleData) {
          if (scheduleData[key] === 1) {
            const parts = key.split('_');
            if (parts.length === 3) {
              const employeeName = parts[0];
              const day = parts[1];
              const shift = parts[2];
              worksheet.addRow([employeeName, day, shift]);
              addedRows++;
            }
          }
        }
      }
      if (addedRows === 0) {
        worksheet.addRow(['No schedule data available']);
        toast.warning('No valid schedule assignments to export');
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // Download file for user
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Export completed!', { description: `Downloaded: ${filename}` });
    } catch (error: any) {
      toast.error('Failed to export schedule', { description: error.message || undefined });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
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
            onClick={handleExport}
            disabled={isExporting}
            className="transition-all duration-200 hover:scale-105"
          >
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
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
    </div>
  );
};

export default ShiftScheduler;
