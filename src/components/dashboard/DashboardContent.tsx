
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Followers" value={profile?.fans ?? 0} />
          <StatCard title="Following" value={profile?.following ?? 0} />
          <StatCard title="Total Likes" value={profile?.heart ?? 0} />
          <StatCard title="Videos" value={profile?.video ?? 0} />
        </div>
      </div>
    </div>
  );
};
