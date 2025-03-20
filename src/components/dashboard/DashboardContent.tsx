
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const StatCard = ({ title, value }: { title: string; value: string | number }) => {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};

export const DashboardContent = () => {
  const { profile } = useAuth();
  
  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome, {profile?.tiktok_username || 'User'}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Followers" value="0" />
          <StatCard title="Following" value="0" />
          <StatCard title="Total Likes" value="0" />
          <StatCard title="Videos" value="0" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest TikTok performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                <p className="text-sm text-gray-500">Activity chart will appear here</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>Breakdown of your follower demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                <p className="text-sm text-gray-500">Demographics chart will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
