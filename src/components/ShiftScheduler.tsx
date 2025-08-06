
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
  const [exportHistory, setExportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // Fetch export history from Neon

  const fetchExportHistory = async () => {

    setHistoryLoading(true);
    try {
      const res = await fetch('/.netlify/functions/getExports');
      if (!res.ok) throw new Error('Failed to fetch export history');
      const data = await res.json();
      setExportHistory(data);
    } catch (err) {
      setExportHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };


  React.useEffect(() => {
    fetchExportHistory();
  }, []);

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

  const fetchScheduleData = async (year: string, month: string) => {

    try {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

      //dummy data
      const employees = [{ name: 'A' }, { name: 'B' }];
      const allShifts = ['S1', 'S2', 'S3'];
      const shiftLeads = ['A', 'B'];
      const teamLeads = ['A', 'B'];

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employees: employees,
          daysInMonth: daysInMonth,
          yearNum: yearNum,
          monthNum: monthNum,
          shiftRequirements: shiftRequirements,
          allShifts: allShifts,
          shiftLeads: shiftLeads,
          teamLeads: teamLeads
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch schedule data: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      toast.error('Failed to fetch schedule data');
      return null;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const monthName = months.find(m => m.value === selectedMonth.split('-')[1])?.label;
      const chennaiTime = getChennaiTimeString();


      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // --- UPLOAD TO GOOGLE CLOUD STORAGE ---
      const uploadToStorage = async (fileBlob, fileName) => {
        // 1. Get signed URL from Netlify Function
        const res = await fetch('/.netlify/functions/getGcsSignedUrl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, contentType: fileBlob.type })
        });
        if (!res.ok) throw new Error('Failed to get GCS signed URL');
        const { url, publicUrl } = await res.json();
        // 2. Upload file to GCS using signed URL
        const uploadRes = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': fileBlob.type },
          body: fileBlob
        });
        if (!uploadRes.ok) throw new Error('Failed to upload file to GCS');
        return publicUrl;
      };
      const fileUrl = await uploadToStorage(blob, filename);

      const filename = `Shift_Schedule_${monthName}_${selectedYear}.xlsx`;

      // Initialize ExcelJS workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Schedule');

      // Add headers
      worksheet.addRow(['Employee', 'Day', 'Shift']);

      // Fetch schedule data
      const year = selectedYear;
      const month = selectedMonth.split('-')[1];
      const scheduleData = await fetchScheduleData(year, month);

      if (scheduleData) {

        for (const key in scheduleData) {
          if (scheduleData[key] === 1) {

            const parts = key.split('_');
            if (parts.length === 3) {
              const employeeName = parts[0];
              const day = parts[1];
              const shift = parts[2];

              worksheet.addRow([employeeName, day, shift]);
            }
          }
        }
      } else {
        worksheet.addRow(['No schedule data available']);
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // --- UPLOAD TO GOOGLE CLOUD STORAGE ---



      // Save export metadata to Neon via Netlify Function
      const now = new Date();
      const generatedDate = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
      const generatedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const status = 'completed';
      const monthYear = `${monthName} ${selectedYear}`;
      await fetch('/.netlify/functions/saveExport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          monthYear,
          generatedDate,
          generatedTime,
          status,
          url: fileUrl
        })
      });
      // Refresh export history
      fetchExportHistory();
      // Download file for user
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

  // Download file from URL
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View file in new tab
  const handleView = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Export History Table */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reports & Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-xs text-blue-700">Current Chennai Time: {chennaiTimeNow}</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Filename</th>
                  <th className="px-2 py-1 border">Month/Year</th>
                  <th className="px-2 py-1 border">Generated Date</th>
                  <th className="px-2 py-1 border">Generated Time</th>
                  <th className="px-2 py-1 border">Status</th>
                  <th className="px-2 py-1 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={6} className="text-center py-2">Loading...</td></tr>
                ) : exportHistory.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-2">No exports found</td></tr>
                ) : (
                  exportHistory.map((exp, idx) => (
                    <tr key={exp.id || idx} className="border-b">
                      <td className="px-2 py-1 border">{exp.filename}</td>
                      <td className="px-2 py-1 border">{exp.month_year || exp.monthYear}</td>
                      <td className="px-2 py-1 border">{exp.generated_date || exp.generatedDate}</td>
                      <td className="px-2 py-1 border">{exp.generated_time || exp.generatedTime}</td>
                      <td className="px-2 py-1 border">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{exp.status}</span>
                      </td>
                      <td className="px-2 py-1 border flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleView(exp.url)} title="View">
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDownload(exp.url, exp.filename)} title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
