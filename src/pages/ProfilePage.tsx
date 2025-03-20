
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCw } from "lucide-react";

// Format time in MM:SS format
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const ProfilePage = () => {
  const { user, profile, loading, profileLoading, refreshTikTokData, getCooldownRemaining } = useAuth();
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
    if (canRefresh) {
      refreshTikTokData();
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Format username by removing @ if present
  const displayUsername = profile?.tiktok_username?.startsWith('@') 
    ? profile.tiktok_username.substring(1) 
    : profile?.tiktok_username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="flex items-center space-x-4">
              {cooldownTime && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="mr-2">Next refresh available in:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{cooldownTime}</span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={!canRefresh || profileLoading}
                className={`flex items-center space-x-1 px-3 py-1 rounded ${
                  canRefresh && !profileLoading
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                <RefreshCw size={16} className={profileLoading ? "animate-spin" : ""} />
                <span>{profileLoading ? "Refreshing..." : "Refresh Data"}</span>
              </button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={displayUsername || 'User'} />
                  ) : (
                    <AvatarFallback>{displayUsername?.substring(0, 2) || user.email?.substring(0, 2) || 'U'}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{displayUsername || 'TikTok User'}</CardTitle>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">TikTok Username</p>
                  <p>{profile?.tiktok_username}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Followers</p>
                  <p>{profile?.fans || '0'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Following</p>
                  <p>{profile?.following || '0'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Likes</p>
                  <p>{profile?.heart || '0'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Videos</p>
                  <p>{profile?.video || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
