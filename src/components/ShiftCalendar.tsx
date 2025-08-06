
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, User, Clock, Plus } from 'lucide-react';

const ShiftCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
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

  // Mock shift data with new color coding and leave management
  const getShiftData = (day: number) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    
    // Mock leave data - some members on leave
    const leaveData = {
      5: ['Sai Krishna'], // 5th day someone is on leave
      12: ['Jeeva', 'Saran'], // 12th day multiple people on leave
      18: ['Manoj']
    };
    
    // Mock week off data - consecutive days after 4-6 working days
    const weekOffData = {
      8: ['Akshay', 'Murugan'], // Week off on 8th-9th
      9: ['Akshay', 'Murugan'],
      15: ['Sahana P', 'Rengadurai'], // Week off on 15th-16th
      16: ['Sahana P', 'Rengadurai'],
      22: ['Karthikeyan'], // Single day week off
      29: ['Jeyakaran', 'Panner'], // Week off on 29th-30th
      30: ['Jeyakaran', 'Panner']
    };

    const membersOnLeave = leaveData[day] || [];
    const membersOnWeekOff = weekOffData[day] || [];

    if (isSunday) {
      return [
        { 
          shift: 'S2', 
          members: ['Jeyakaran', 'Sai Krishna'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Jeyakaran'], // Mon-Wed WFO pattern
          wfhMembers: ['Sai Krishna']
        },
        { 
          shift: 'S3', 
          members: ['Karthikeyan', 'Jeeva'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Karthikeyan'],
          wfhMembers: ['Jeeva']
        }
      ];
    } else if (isWeekend) {
      return [
        { 
          shift: 'S1', 
          members: ['Manoj', 'Saran'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Manoj'],
          wfhMembers: ['Saran']
        },
        { 
          shift: 'S2', 
          members: ['Panner', 'Akshay'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Panner'],
          wfhMembers: ['Akshay']
        },
        { 
          shift: 'S3', 
          members: ['SaiKumar', 'Murugan'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['SaiKumar'],
          wfhMembers: ['Murugan']
        }
      ];
    } else {
      return [
        { 
          shift: 'S1', 
          members: ['Jeyakaran', 'Sai Krishna', 'Sahana P'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 3,
          wfoMembers: ['Jeyakaran', 'Sahana P'], // Following Mon-Wed pattern
          wfhMembers: ['Sai Krishna']
        },
        { 
          shift: 'S2', 
          members: ['Karthikeyan', 'Rengadurai'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Karthikeyan'],
          wfhMembers: ['Rengadurai']
        },
        { 
          shift: 'S3', 
          members: ['Manoj', 'Jeeva', 'Saran'].filter(m => !membersOnLeave.includes(m) && !membersOnWeekOff.includes(m)), 
          count: 3,
          wfoMembers: ['Manoj', 'Jeeva'],
          wfhMembers: ['Saran']
        }
      ];
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'S1': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'S2': return 'bg-green-100 text-green-800 border-green-300';
      case 'S3': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WFO': return 'bg-green-100 text-green-800 border-green-300';
      case 'WFH': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'OFF': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'LEAVE': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMemberStatus = (member: string, day: number) => {
    // Check for leave first
    const leaveData = {
      5: ['Sai Krishna'],
      12: ['Jeeva', 'Saran'],
      18: ['Manoj']
    };
    
    // Check for week off
    const weekOffData = {
      8: ['Akshay', 'Murugan'],
      9: ['Akshay', 'Murugan'],
      15: ['Sahana P', 'Rengadurai'],
      16: ['Sahana P', 'Rengadurai'],
      22: ['Karthikeyan'],
      29: ['Jeyakaran', 'Panner'],
      30: ['Jeyakaran', 'Panner']
    };

    if (leaveData[day]?.includes(member)) return 'LEAVE';
    if (weekOffData[day]?.includes(member)) return 'OFF';
    
    // Determine WFO/WFH based on consecutive 3-day pattern
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    
    // Simple pattern for demonstration - in real implementation, this would be more complex
    if (dayOfWeek >= 1 && dayOfWeek <= 3) return 'WFO'; // Mon-Wed
    if (dayOfWeek >= 4 && dayOfWeek <= 5) return 'WFH'; // Thu-Fri
    
    return Math.random() > 0.5 ? 'WFO' : 'WFH';
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
              <div key={`empty-${i}`} className="h-40 border-r border-b last:border-r-0"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const shiftData = getShiftData(day);
              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              
              return (
                <Dialog key={day}>
                  <DialogTrigger asChild>
                    <div className={`h-40 border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 ${isWeekend ? 'bg-orange-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isWeekend ? 'text-orange-600' : ''}`}>{day}</span>
                        <Plus className="h-3 w-3 text-gray-400" />
                      </div>
                      
                      <div className="space-y-1">
                        {shiftData.map((shift, index) => (
                          <div key={index} className="relative">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getShiftColor(shift.shift)} w-full justify-center border`}
                            >
                              {shift.shift} ({shift.count})
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Schedule for {monthName.split(' ')[0]} {day}, {currentDate.getFullYear()}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {shiftData.map((shift, shiftIndex) => (
                        <div key={shiftIndex} className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Badge className={getShiftColor(shift.shift)}>
                              {shift.shift}
                            </Badge>
                            Shift Members
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {shift.members.map((member, memberIndex) => {
                              const status = getMemberStatus(member, day);
                              return (
                                <div key={memberIndex} className="flex items-center justify-between p-2 border rounded-md">
                                  <span className="font-medium">{member}</span>
                                  <Badge variant="outline" className={getStatusColor(status)}>
                                    {status}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Show members on leave or week off for this shift */}
                          {day === 5 && shift.shift === 'S1' && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">On Leave:</span> Sai Krishna
                            </div>
                          )}
                          {day === 12 && (shift.shift === 'S2' || shift.shift === 'S3') && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">On Leave:</span> {shift.shift === 'S2' ? 'Jeeva' : 'Saran'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Updated Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Shifts</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">S1</Badge>
                  <span className="text-xs">Morning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">S2</Badge>
                  <span className="text-xs">Afternoon</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">S3</Badge>
                  <span className="text-xs">Evening</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Work Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">WFO</Badge>
                  <span className="text-xs">Work From Office</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">WFH</Badge>
                  <span className="text-xs">Work From Home</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Time Off</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800 border-gray-300">OFF</Badge>
                  <span className="text-xs">Week Off</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-50 text-gray-600 border-gray-200">LEAVE</Badge>
                  <span className="text-xs">Approved Leave</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Other</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-50 border rounded"></div>
                  <span className="text-xs">Weekend</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs">Click for details</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftCalendar;
