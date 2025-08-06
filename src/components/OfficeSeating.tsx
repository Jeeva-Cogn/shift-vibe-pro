
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, User, MapPin, Calendar } from 'lucide-react';

const OfficeSeating = () => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const officeSeats = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    isOccupied: i < 6,
    occupant: i < 6 ? `Member ${i + 1}` : null,
    shift: i < 6 ? ['S1', 'S2', 'S3'][i % 3] : null
  }));

  // Updated hybrid schedule following Mon-Wed WFO, Thu-Fri WFH pattern
  const hybridSchedule = [
    { member: 'Jeyakaran', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Karthikeyan', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Manoj', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Panner', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'SaiKumar', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Sai Krishna', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Jeeva', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Saran', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Akshay', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Murugan', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Sahana P', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
    { member: 'Rengadurai', wfo: ['Mon', 'Tue', 'Wed'], wfh: ['Thu', 'Fri'] },
  ];

  const getStatusBadge = (type: 'wfo' | 'wfh' | 'off' | 'leave') => {
    switch (type) {
      case 'wfo':
        return <Badge className="bg-green-100 text-green-800 border-green-300">WFO</Badge>;
      case 'wfh':
        return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">WFH</Badge>;
      case 'off':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">OFF</Badge>;
      case 'leave':
        return <Badge className="bg-gray-50 text-gray-600 border-gray-200">LEAVE</Badge>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Office Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Office Seating Layout (8 Seats Available)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {officeSeats.map((seat) => (
              <div
                key={seat.id}
                className={`
                  aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 text-center
                  ${seat.isOccupied 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                  }
                `}
              >
                <MapPin className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Seat {seat.id}</span>
                {seat.isOccupied && (
                  <>
                    <span className="text-xs truncate mt-1">{seat.occupant}</span>
                    <Badge variant="outline" className="text-xs mt-1">{seat.shift}</Badge>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm">Occupied (6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
              <span className="text-sm">Available (2)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updated Hybrid Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Hybrid Work Schedule (Consecutive 3 WFO + 2 WFH Pattern)
          </CardTitle>
          <div className="text-sm text-gray-600">
            Pattern: Monday-Wednesday (WFO) → Thursday-Friday (WFH) → Weekend OFF
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Member</th>
                  <th className="text-center p-3 font-medium">Mon</th>
                  <th className="text-center p-3 font-medium">Tue</th>
                  <th className="text-center p-3 font-medium">Wed</th>
                  <th className="text-center p-3 font-medium">Thu</th>
                  <th className="text-center p-3 font-medium">Fri</th>
                  <th className="text-center p-3 font-medium">Sat</th>
                  <th className="text-center p-3 font-medium">Sun</th>
                </tr>
              </thead>
              <tbody>
                {hybridSchedule.map((schedule, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{schedule.member}</td>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <td key={day} className="p-3 text-center">
                        {schedule.wfo.includes(day) ? (
                          getStatusBadge('wfo')
                        ) : schedule.wfh.includes(day) ? (
                          getStatusBadge('wfh')
                        ) : day === 'Sat' || day === 'Sun' ? (
                          getStatusBadge('off')
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Updated Status Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-orange-600" />
              Work Status Legend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Work From Office</span>
                {getStatusBadge('wfo')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Work From Home</span>
                {getStatusBadge('wfh')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Week Off</span>
                {getStatusBadge('off')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approved Leave</span>
                {getStatusBadge('leave')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">WFO Pattern Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Consecutive WFO days:</span>
                <Badge variant="outline">3 days (Mon-Wed)</Badge>
              </div>
              <div className="flex justify-between">
                <span>Consecutive WFH days:</span>
                <Badge variant="outline">2 days (Thu-Fri)</Badge>
              </div>
              <div className="flex justify-between">
                <span>Min office members per shift:</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex justify-between">
                <span>Week off after:</span>
                <Badge variant="outline">4-6 work days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficeSeating;
