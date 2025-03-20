
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, CloudOff, CloudDownload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TikTokPosts from "./TikTokPosts";

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

// Format time in MM:SS format
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const DashboardContent = () => {
  const { 
    profile, 
    refreshTikTokData, 
    profileLoading, 
    getCooldownRemaining,
    isDataFetchingEnabled,
    setDataFetchingEnabled
  } = useAuth();
  const [cooldownTime, setCooldownTime] = useState<string | null>(null);
  const [canRefresh, setCanRefresh] = useState(false);

  useEffect(() => {
    // Initial check
    const remaining = getCooldownRemaining();
    if (remaining === null || remaining === 0) {
      setCooldownTime(null);
      setCanRefresh(true);
    } else {
      setCooldownTime(formatTime(remaining));
      setCanRefresh(false);
    }

    // Set up the timer to update every second
    const interval = setInterval(() => {
      const remaining = getCooldownRemaining();
      if (remaining === null || remaining === 0) {
        setCooldownTime(null);
        setCanRefresh(true);
      } else {
        setCooldownTime(formatTime(remaining));
        setCanRefresh(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getCooldownRemaining]);
  
  const handleRefresh = () => {
    if (canRefresh && isDataFetchingEnabled) {
      refreshTikTokData();
    }
  };
  
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome, {profile?.tiktok_username || 'User'}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            {cooldownTime && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">Next refresh available in:</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{cooldownTime}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="data-fetching" 
                checked={isDataFetchingEnabled}
                onCheckedChange={setDataFetchingEnabled}
              />
              <Label htmlFor="data-fetching" className="flex items-center gap-2">
                {isDataFetchingEnabled ? (
                  <>
                    <CloudDownload className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Data fetching enabled</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Data fetching disabled</span>
                  </>
                )}
              </Label>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={!canRefresh || profileLoading || !isDataFetchingEnabled}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              canRefresh && !profileLoading && isDataFetchingEnabled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            <RefreshCw size={16} className={profileLoading ? "animate-spin" : ""} />
            <span>{profileLoading ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Followers" value={profile?.fans ?? 0} />
          <StatCard title="Following" value={profile?.following ?? 0} />
          <StatCard title="Total Likes" value={profile?.heart ?? 0} />
          <StatCard title="Videos" value={profile?.video ?? 0} />
        </div>
        
        {/* Add TikTok Posts Component */}
        <TikTokPosts />
      </div>
    </div>
  );
};
