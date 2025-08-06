
import React, { useState } from 'react';
import { Calendar, Users, Settings, Clock, Building2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamManagement from '@/components/TeamManagement';
import ShiftScheduler from '@/components/ShiftScheduler';
import ShiftCalendar from '@/components/ShiftCalendar';
import Reports from '@/components/Reports';

const Index = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12">
          <div className="text-8xl font-bold text-blue-600 select-none">
            Jeeva's Vibe
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <div className="h-6 w-6 text-white font-bold flex items-center justify-center">
                  SS
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Shift Scheduler</h1>
                <p className="text-sm text-gray-500">Team Management & Scheduling</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>15 Team Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-2/3 mx-auto">
            <TabsTrigger value="schedule" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Clock className="h-4 w-4" />
              Calendar & Leaves
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6 animate-fade-in">
            <div className="grid gap-6">
              <Card className="transition-all duration-300 hover:shadow-lg">
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

          <TabsContent value="team" className="space-y-6 animate-fade-in">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team & Office Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6 animate-fade-in">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Calendar & Leave Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShiftCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 animate-fade-in">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Reports & Export History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Reports />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
