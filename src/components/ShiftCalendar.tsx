
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, User, Clock } from 'lucide-react';

const ShiftCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Mock shift data
  const getShiftData = (day: number) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    
    if (isSunday) {
      return [
        { shift: 'S2', members: ['Jeyakaran', 'Sai Krishna'], count: 2 },
        { shift: 'S3', members: ['Karthikeyan', 'Jeeva'], count: 2 }
      ];
    } else if (isWeekend) {
      return [
        { shift: 'S1', members: ['Manoj', 'Saran'], count: 2 },
        { shift: 'S2', members: ['Panner', 'Akshay'], count: 2 },
        { shift: 'S3', members: ['SaiKumar', 'Murugan'], count: 2 }
      ];
    } else {
      return [
        { shift: 'S1', members: ['Jeyakaran', 'Sai Krishna', 'Sahana P'], count: 3 },
        { shift: 'S2', members: ['Karthikeyan', 'Rengadurai'], count: 2 },
        { shift: 'S3', members: ['Manoj', 'Jeeva', 'Saran'], count: 3 }
      ];
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'S1': return 'bg-blue-100 text-blue-800';
      case 'S2': return 'bg-green-100 text-green-800';
      case 'S3': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{monthName}</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-0 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="h-32 border-r border-b last:border-r-0"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const shiftData = getShiftData(day);
              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              
              return (
                <div key={day} className={`h-32 border-r border-b last:border-r-0 p-2 ${isWeekend ? 'bg-orange-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isWeekend ? 'text-orange-600' : ''}`}>{day}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {shiftData.map((shift, index) => (
                      <div key={index} className="group relative">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getShiftColor(shift.shift)} w-full justify-center cursor-pointer`}
                        >
                          {shift.shift} ({shift.count})
                        </Badge>
                        
                        {/* Tooltip */}
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 bg-black text-white text-xs rounded p-2 whitespace-nowrap">
                          <div className="font-medium">{shift.shift} Shift</div>
                          {shift.members.map((member, idx) => (
                            <div key={idx}>• {member}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">S1</Badge>
              <span className="text-sm">Shift 1 (Morning)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">S2</Badge>
              <span className="text-sm">Shift 2 (Afternoon)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">S3</Badge>
              <span className="text-sm">Shift 3 (Evening)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border rounded"></div>
              <span className="text-sm">Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Hover for details</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftCalendar;
