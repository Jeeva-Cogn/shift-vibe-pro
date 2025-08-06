
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, RefreshCw, Download, Users } from 'lucide-react';
import { toast } from 'sonner';

const ShiftScheduler = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [isGenerating, setIsGenerating] = useState(false);

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
      // Simulate schedule generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Schedule generated successfully!');
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-01">January 2024</SelectItem>
                <SelectItem value="2024-02">February 2024</SelectItem>
                <SelectItem value="2024-03">March 2024</SelectItem>
                <SelectItem value="2024-04">April 2024</SelectItem>
                <SelectItem value="2024-05">May 2024</SelectItem>
                <SelectItem value="2024-06">June 2024</SelectItem>
                <SelectItem value="2024-07">July 2024</SelectItem>
                <SelectItem value="2024-08">August 2024</SelectItem>
                <SelectItem value="2024-09">September 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-12">December 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateSchedule} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Shift Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(shiftRequirements).map(([day, shifts]) => (
          <Card key={day}>
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
      <Card>
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
                <li>• One of the 5 leads must be in every shift</li>
                <li>• Leads: Jeyakaran, Karthikeyan, Manoj, Panner, SaiKumar</li>
                <li>• Dinesh and Mano are S2 only, no shifts</li>
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
                <li>• 3 days WFO, 2 days WFH per week</li>
                <li>• At least 2 members in office per shift</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">Leave Management</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Consecutive week offs allowed</li>
                <li>• Extra offs with multiple day selection</li>
                <li>• Week offs limited to monthly weekends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftScheduler;
