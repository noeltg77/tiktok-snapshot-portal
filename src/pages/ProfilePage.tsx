
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, profile, loading, profileLoading, refreshTikTokData } = useAuth();
  const dataRefreshedRef = useRef(false);

  // Refresh TikTok data only once when profile page loads
  useEffect(() => {
    if (user && profile?.tiktok_username && !dataRefreshedRef.current) {
      console.log("Refreshing TikTok data on first profile page load");
      refreshTikTokData();
      dataRefreshedRef.current = true;
    }
  }, [user, profile?.tiktok_username]);

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
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
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
