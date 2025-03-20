
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user, signOut, loading, profileLoading, hasTikTokUsername } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to TikTok username form if user doesn't have a username set
  useEffect(() => {
    if (!loading && !profileLoading && user && !hasTikTokUsername) {
      navigate('/tiktok-username');
    }
  }, [user, loading, profileLoading, hasTikTokUsername, navigate]);

  // If still loading, show a loading indicator
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have a TikTok username, they'll be redirected in the useEffect
  // This is just a fallback
  if (!hasTikTokUsername) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TikTok Data Dashboard</h1>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome to your TikTok Data Dashboard</CardTitle>
            <CardDescription>
              You're now authenticated and ready to access TikTok data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p>This is a placeholder dashboard. The full TikTok data functionality will be implemented in future updates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
