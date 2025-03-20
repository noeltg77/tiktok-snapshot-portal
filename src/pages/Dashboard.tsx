
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const { user, loading, profileLoading, hasTikTokUsername } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to TikTok username form if user doesn't have a username set
  React.useEffect(() => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <DashboardSidebar />
        <DashboardContent />
      </div>
    </div>
  );
};

export default Dashboard;
