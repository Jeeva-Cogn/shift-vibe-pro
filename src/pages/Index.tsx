
import React, { useState } from 'react';
import { Calendar, Users, Settings, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamManagement from '@/components/TeamManagement';
import ShiftScheduler from '@/components/ShiftScheduler';
import OfficeSeating from '@/components/OfficeSeating';
import ShiftCalendar from '@/components/ShiftCalendar';

const Index = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Shift Scheduler Pro</h1>
                <p className="text-sm text-gray-500">Team Management & Scheduling</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>13 Team Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2 mx-auto">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="office" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Office
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Shift Scheduler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ShiftScheduler />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="office" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Office Seating & WFO Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OfficeSeating />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Monthly Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShiftCalendar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
