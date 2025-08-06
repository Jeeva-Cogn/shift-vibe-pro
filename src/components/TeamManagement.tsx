
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCheck, UserX, Calendar, Plus, User, Building2, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChennaiTimeString } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: 'lead' | 'associate' | 'teamlead';
  isActive: boolean;
  shifts: string[];
  weekendOff?: boolean;
}

interface SeatInfo {
  seatNumber: number;
  isOccupied: boolean;
  occupant?: string;
  shift?: string;
}

const TeamManagement = () => {
  const [chennaiTimeNow, setChennaiTimeNow] = React.useState(getChennaiTimeString());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setChennaiTimeNow(getChennaiTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const [teamMembers] = useState<TeamMember[]>([
    // Lead members (must be in all shifts)
    { id: '1', name: 'Jeyakaran', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '2', name: 'Karthikeyan', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '3', name: 'Manoj', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '4', name: 'Panner', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '5', name: 'SaiKumar', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    
    // Team Leads (S2 only, weekends off)
    { id: '6', name: 'Dinesh', role: 'teamlead', isActive: true, shifts: ['S2'], weekendOff: true },
    { id: '7', name: 'Mano', role: 'teamlead', isActive: true, shifts: ['S2'], weekendOff: true },
    
    // Associates
    { id: '8', name: 'Sai Krishna', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '9', name: 'Jeeva', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '10', name: 'Saran', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '11', name: 'Akshay', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '12', name: 'Murugan', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '13', name: 'Sahana P', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '14', name: 'Rengadurai', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
  ]);

  const [officeSeats] = useState<SeatInfo[]>([
    { seatNumber: 1, isOccupied: true, occupant: 'Jeyakaran', shift: 'S1' },
    { seatNumber: 2, isOccupied: true, occupant: 'Sai Krishna', shift: 'S1' },
    { seatNumber: 3, isOccupied: false },
    { seatNumber: 4, isOccupied: true, occupant: 'Dinesh', shift: 'S2' },
    { seatNumber: 5, isOccupied: true, occupant: 'Jeeva', shift: 'S2' },
    { seatNumber: 6, isOccupied: false },
    { seatNumber: 7, isOccupied: false },
    { seatNumber: 8, isOccupied: false },
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'associate': return 'bg-green-100 text-green-800';
      case 'teamlead': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'lead': return 'Lead (All shifts)';
      case 'associate': return 'Associate';
      case 'teamlead': return 'Team Lead (S2 only)';
      default: return 'Unknown';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const activeShiftMembers = teamMembers.filter(member => member.role !== 'teamlead');

  return (
    <div className="space-y-6">
      {/* Chennai Time Banner */}
      <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-semibold rounded">
        Current Chennai Time: {chennaiTimeNow}
      </div>
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Overview
          </TabsTrigger>
          <TabsTrigger value="office" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Office Seating
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Team Overview</h3>
              <p className="text-sm text-gray-600">
                Total: 15 members | Active Shift Members: {activeShiftMembers.length} | Team Leads: 2
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="grid gap-4">
            {/* Lead Members */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Lead Members (5/5)
                  <Badge variant="secondary" className="ml-2">Must be in all shifts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.filter(member => member.role === 'lead').map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-blue-200 bg-blue-50 transition-all duration-200 hover:scale-105">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <div className="flex gap-1 mt-1">
                          {member.shifts.map(shift => (
                            <Badge key={shift} variant="outline" className="text-xs">{shift}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Leads */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Team Leads (2/2)
                  <Badge variant="secondary" className="ml-2">S2 only, Weekend off</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.filter(member => member.role === 'teamlead').map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-purple-200 bg-purple-50 transition-all duration-200 hover:scale-105">
                      <Avatar>
                        <AvatarFallback className="bg-purple-600 text-white">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">S2 Only</Badge>
                          <Badge variant="outline" className="text-xs">Weekend Off</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Associates */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  Associates (8/8)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.filter(member => member.role === 'associate').map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50 transition-all duration-200 hover:scale-105">
                      <Avatar>
                        <AvatarFallback className="bg-green-600 text-white">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-600">All shifts available</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="office" className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Office Seating Management</h3>
              <p className="text-sm text-gray-600">
                8 seats available | Currently occupied: {officeSeats.filter(seat => seat.isOccupied).length}/8
              </p>
            </div>
          </div>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Current Seating Arrangement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {officeSeats.map((seat) => (
                  <div
                    key={seat.seatNumber}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105
                      ${seat.isOccupied 
                        ? 'border-green-300 bg-green-50 shadow-md' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className="font-semibold text-sm mb-2">
                      Seat {seat.seatNumber}
                    </div>
                    {seat.isOccupied ? (
                      <div>
                        <div className="text-xs font-medium text-green-700 mb-1">
                          {seat.occupant}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {seat.shift}
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* WFO/WFH Rules */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                WFO/WFH Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">WFO Pattern</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 3 consecutive days WFO per week</li>
                    <li>• 2 days WFH per week</li>
                    <li>• At least 2 members in office per shift</li>
                    <li>• No alternate WFO pattern</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Color Coding</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <span className="inline-block w-3 h-3 bg-gray-400 rounded mr-2"></span>OFF - Grey</li>
                    <li>• <span className="inline-block w-3 h-3 bg-gray-300 rounded mr-2"></span>LEAVE - Light Grey</li>
                    <li>• <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>WFO - Green</li>
                    <li>• <span className="inline-block w-3 h-3 bg-cyan-500 rounded mr-2"></span>WFH - Cyan</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManagement;
