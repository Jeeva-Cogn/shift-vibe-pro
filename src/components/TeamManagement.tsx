
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCheck, UserX, Calendar, Plus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: 'lead' | 'associate' | 'support';
  isActive: boolean;
  shifts: string[];
}

const TeamManagement = () => {
  const [teamMembers] = useState<TeamMember[]>([
    // Lead members (must be in all shifts)
    { id: '1', name: 'Jeyakaran', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '2', name: 'Karthikeyan', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '3', name: 'Manoj', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '4', name: 'Panner', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '5', name: 'SaiKumar', role: 'lead', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    
    // Support members (S2 only)
    { id: '6', name: 'Dinesh', role: 'support', isActive: false, shifts: ['S2'] },
    { id: '7', name: 'Mano', role: 'support', isActive: false, shifts: ['S2'] },
    
    // Associates
    { id: '8', name: 'Sai Krishna', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '9', name: 'Jeeva', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '10', name: 'Saran', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '11', name: 'Akshay', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '12', name: 'Murugan', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '13', name: 'Sahana P', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
    { id: '14', name: 'Rengadurai', role: 'associate', isActive: true, shifts: ['S1', 'S2', 'S3'] },
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'associate': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'lead': return 'Lead (Must be in shifts)';
      case 'associate': return 'Associate';
      case 'support': return 'Support (S2 only)';
      default: return 'Unknown';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Overview</h3>
          <p className="text-sm text-gray-600">Manage your 13 team members and their roles</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Lead Members */}
        <Card>
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
                <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
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

        {/* Associates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Associates (7/7)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.filter(member => member.role === 'associate').map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50">
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

        {/* Support Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserX className="h-4 w-4 text-gray-600" />
              Support Members (2/2)
              <Badge variant="secondary" className="ml-2">S2 only, No shifts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.filter(member => member.role === 'support').map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <Avatar>
                    <AvatarFallback className="bg-gray-500 text-white">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">S2 Only</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamManagement;
