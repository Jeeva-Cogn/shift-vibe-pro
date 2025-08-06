
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet, Calendar, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { getChennaiTimeString } from '@/lib/utils';

interface ExportRecord {
  id: string;
  filename: string;
  generatedDate: string;
  generatedTime: string;
  month: string;
  year: string;
  status: 'completed' | 'pending' | 'failed';
}

const Reports = () => {
  const [chennaiTimeNow, setChennaiTimeNow] = React.useState(getChennaiTimeString());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setChennaiTimeNow(getChennaiTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([
    {
      id: '1',
      filename: 'Shift_Schedule_January_2024.xlsx',
      generatedDate: '2024-01-15',
      generatedTime: '10:30 AM',
      month: 'January',
      year: '2024',
      status: 'completed'
    },
    {
      id: '2', 
      filename: 'Shift_Schedule_February_2024.xlsx',
      generatedDate: '2024-02-12',
      generatedTime: '02:15 PM',
      month: 'February',
      year: '2024',
      status: 'completed'
    }
  ]);

  const handleDownload = (record: ExportRecord) => {
    try {
      // Create sample data for the requested file
      const sampleData = [
        ['Employee', 'Date', 'Shift', 'Type', 'Seat'],
        ['Jeyakaran (Lead)', '1-Jan-2024', 'S1', 'WFO', 'A1'],
        ['Karthikeyan (Lead)', '1-Jan-2024', 'S2', 'WFO', 'A2'],
        ['Manoj (Lead)', '1-Jan-2024', 'S3', 'WFH', '-'],
        ['Sai Krishna', '1-Jan-2024', 'S1', 'WFO', 'B1'],
        ['Jeeva', '1-Jan-2024', 'S2', 'WFH', '-'],
        ['Saran', '1-Jan-2024', 'S3', 'WFO', 'B2'],
        ['Akshay', '2-Jan-2024', 'S1', 'WFO', 'C1'],
        ['Murugan', '2-Jan-2024', 'S2', 'WFH', '-'],
        ['Sahana P', '2-Jan-2024', 'S3', 'WFO', 'C2'],
        ['Rengadurai', '2-Jan-2024', 'OFF', 'OFF', '-']
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

      // Set column widths
      worksheet['!cols'] = [
        { width: 20 }, // Employee
        { width: 12 }, // Date
        { width: 8 },  // Shift
        { width: 8 },  // Type
        { width: 8 }   // Seat
      ];

      // (Removed cell styling for compatibility with open-source xlsx)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shift Schedule');

      // Generate Excel file and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = record.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(link.href);
      
      toast.success(`Downloaded ${record.filename}`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleView = (record: ExportRecord) => {
    toast.info(`Opening ${record.filename} for preview`);
    // Here would be the view logic
  };

  const handleDelete = (recordId: string) => {
    setExportHistory(prev => prev.filter(record => record.id !== recordId));
    toast.success('Export record deleted');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Chennai Time Banner */}
      <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-semibold rounded">
        Current Chennai Time: {chennaiTimeNow}
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Total Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{exportHistory.length}</div>
            <p className="text-sm text-gray-600">Excel files generated</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {exportHistory.filter(r => new Date(r.generatedDate).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-sm text-gray-600">Reports generated</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-purple-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((exportHistory.filter(r => r.status === 'completed').length / exportHistory.length) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Successful exports</p>
          </CardContent>
        </Card>
      </div>

      {/* Export History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Generated Date</TableHead>
                    <TableHead>Generated Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportHistory.map((record) => (
                    <TableRow key={record.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{record.filename}</TableCell>
                      <TableCell>{record.month} {record.year}</TableCell>
                      <TableCell>{new Date(record.generatedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{record.generatedTime}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(record)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(record)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(record.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No export history available</p>
              <p className="text-sm">Generate your first shift schedule to see reports here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
