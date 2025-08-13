
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Clock, Plus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import { cn, getChennaiTimeString } from '@/lib/utils';

interface LeaveRequest {
  member: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

const ShiftCalendar = () => {
  const [chennaiTimeNow, setChennaiTimeNow] = React.useState(getChennaiTimeString());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setChennaiTimeNow(getChennaiTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  // Load leave requests from localStorage
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('leaveRequests');
      return saved ? JSON.parse(saved) : [
        { member: 'Sai Krishna', date: '2025-01-05', status: 'approved' },
        { member: 'Jeeva', date: '2025-01-12', status: 'approved' },
        { member: 'Saran', date: '2025-01-12', status: 'approved' },
        { member: 'Manoj', date: '2025-01-18', status: 'approved' },
      ];
    } catch {
      return [
        { member: 'Sai Krishna', date: '2025-01-05', status: 'approved' },
        { member: 'Jeeva', date: '2025-01-12', status: 'approved' },
        { member: 'Saran', date: '2025-01-12', status: 'approved' },
        { member: 'Manoj', date: '2025-01-18', status: 'approved' },
      ];
    }
  });
  const [selectedMemberForLeave, setSelectedMemberForLeave] = useState<string>('');
  const [selectedLeaveDate, setSelectedLeaveDate] = useState<Date>();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Save initial leave requests to localStorage
  React.useEffect(() => {
    if (!localStorage.getItem('leaveRequests')) {
      localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
    }
  }, []);

  const teamMembers = [
    'Jeyakaran', 'Karthikeyan', 'Manoj', 'Panner', 'SaiKumar', 
    'Sai Krishna', 'Jeeva', 'Saran', 'Akshay', 'Murugan', 
    'Sahana P', 'Rengadurai'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  const handleMonthYearChange = (type: 'month' | 'year', value: string) => {
    const newDate = new Date(currentDate);
    if (type === 'month') {
      newDate.setMonth(months.indexOf(value));
    } else {
      newDate.setFullYear(parseInt(value));
    }
    setCurrentDate(newDate);
  };

  const isOnLeave = (member: string, day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaveRequests.some(req => 
      req.member === member && 
      req.date === dateStr && 
      req.status === 'approved'
    );
  };

  const addLeaveRequest = () => {
    if (selectedMemberForLeave && selectedLeaveDate) {
      const dateStr = format(selectedLeaveDate, 'yyyy-MM-dd');
      const newRequest: LeaveRequest = {
        member: selectedMemberForLeave,
        date: dateStr,
        status: 'approved'
      };
      
      // Check if leave already exists for this member on this date
      const existingIndex = leaveRequests.findIndex(req => 
        req.member === selectedMemberForLeave && req.date === dateStr
      );
      
      let updatedRequests;
      if (existingIndex >= 0) {
        // Update existing request
        updatedRequests = [...leaveRequests];
        updatedRequests[existingIndex] = newRequest;
      } else {
        // Add new request
        updatedRequests = [...leaveRequests, newRequest];
      }
      
      setLeaveRequests(updatedRequests);
      // Save to localStorage for ShiftRoster access
      localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
      
      setSelectedMemberForLeave('');
      setSelectedLeaveDate(undefined);
      setShowLeaveDialog(false);
    }
  };

  const removeLeaveRequest = (member: string, date: string) => {
    const updatedRequests = leaveRequests.filter(req => 
      !(req.member === member && req.date === date)
    );
    setLeaveRequests(updatedRequests);
    // Save to localStorage for ShiftRoster access
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getShiftData = (day: number) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    
    // Week off data - consecutive days after 4-6 working days
    const weekOffData = {
      8: ['Akshay', 'Murugan'],
      9: ['Akshay', 'Murugan'],
      15: ['Sahana P', 'Rengadurai'],
      16: ['Sahana P', 'Rengadurai'],
      22: ['Karthikeyan'],
      29: ['Jeyakaran', 'Panner'],
      30: ['Jeyakaran', 'Panner']
    };

    const membersOnWeekOff = weekOffData[day] || [];

    if (isSunday) {
      return [
        { 
          shift: 'S2', 
          members: ['Jeyakaran', 'Sai Krishna'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Jeyakaran'],
          wfhMembers: ['Sai Krishna']
        },
        { 
          shift: 'S3', 
          members: ['Karthikeyan', 'Jeeva'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Karthikeyan'],
          wfhMembers: ['Jeeva']
        }
      ];
    } else if (isWeekend) {
      return [
        { 
          shift: 'S1', 
          members: ['Manoj', 'Saran'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Manoj'],
          wfhMembers: ['Saran']
        },
        { 
          shift: 'S2', 
          members: ['Panner', 'Akshay'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Panner'],
          wfhMembers: ['Akshay']
        },
        { 
          shift: 'S3', 
          members: ['SaiKumar', 'Murugan'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['SaiKumar'],
          wfhMembers: ['Murugan']
        }
      ];
    } else {
      return [
        { 
          shift: 'S1', 
          members: ['Jeyakaran', 'Sai Krishna', 'Sahana P'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 3,
          wfoMembers: ['Jeyakaran', 'Sahana P'],
          wfhMembers: ['Sai Krishna']
        },
        { 
          shift: 'S2', 
          members: ['Karthikeyan', 'Rengadurai'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 2,
          wfoMembers: ['Karthikeyan'],
          wfhMembers: ['Rengadurai']
        },
        { 
          shift: 'S3', 
          members: ['Manoj', 'Jeeva', 'Saran'].filter(m => !isOnLeave(m, day) && !membersOnWeekOff.includes(m)), 
          count: 3,
          wfoMembers: ['Manoj', 'Jeeva'],
          wfhMembers: ['Saran']
        }
      ];
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'S1': return 'badge-shift-s1';
      case 'S2': return 'badge-shift-s2';
      case 'S3': return 'badge-shift-s3';
      default: return 'badge-status-off';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WFO': return 'badge-status-wfo';
      case 'WFH': return 'badge-status-wfh';
      case 'OFF': return 'badge-status-off';
      case 'LEAVE': return 'badge-status-leave';
      default: return 'badge-status-off';
    }
  };

  const getMemberStatus = (member: string, day: number) => {
    // Check for leave first
    if (isOnLeave(member, day)) return 'LEAVE';
    
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

    if (weekOffData[day]?.includes(member)) return 'OFF';
    
    // Determine WFO/WFH based on consecutive 3-day pattern
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 3) return 'WFO'; // Mon-Wed
    if (dayOfWeek >= 4 && dayOfWeek <= 5) return 'WFH'; // Thu-Fri
    
    return Math.random() > 0.5 ? 'WFO' : 'WFH';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header with Month/Year Selectors */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Calendar & Leave Management</h3>
          </div>
          <div className="flex items-center gap-2">
            <Select value={months[currentDate.getMonth()]} onValueChange={(value) => handleMonthYearChange('month', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentDate.getFullYear().toString()} onValueChange={(value) => handleMonthYearChange('year', value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowLeaveDialog(true)}>
            <UserMinus className="h-4 w-4 mr-2" />
            Add Leave
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leave Management Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Member</label>
              <Select value={selectedMemberForLeave} onValueChange={setSelectedMemberForLeave}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedLeaveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedLeaveDate ? format(selectedLeaveDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedLeaveDate}
                    onSelect={setSelectedLeaveDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button onClick={addLeaveRequest} className="flex-1">
                Add Leave
              </Button>
              <Button variant="outline" onClick={() => setShowLeaveDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No leave requests</p>
          ) : (
            <div className="space-y-2">
              {leaveRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{request.member}</span>
                    <span className="text-sm text-gray-600">{format(new Date(request.date), 'PPP')}</span>
                    <Badge className={getStatusColor('LEAVE')}>
                      {request.status.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeLeaveRequest(request.member, request.date)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <Badge className="badge-shift-s1">S1</Badge>
                  <span className="text-xs">Morning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="badge-shift-s2">S2</Badge>
                  <span className="text-xs">Afternoon</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="badge-shift-s3">S3</Badge>
                  <span className="text-xs">Evening</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Work Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="badge-status-wfo">WFO</Badge>
                  <span className="text-xs">Work From Office</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="badge-status-wfh">WFH</Badge>
                  <span className="text-xs">Work From Home</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Time Off</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="badge-status-off">OFF</Badge>
                  <span className="text-xs">Week Off</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="badge-status-leave">LEAVE</Badge>
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
      
      {/* Chennai Time Banner */}
      <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-semibold rounded">
        Current Chennai Time: {chennaiTimeNow}
      </div>
    </div>
  );
};

export default ShiftCalendar;
