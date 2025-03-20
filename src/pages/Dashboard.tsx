
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const { user, loading, profileLoading, hasTikTokUsername, refreshTikTokData } = useAuth();
  const navigate = useNavigate();
  const dataRefreshedRef = useRef(false);
  
  // Refresh TikTok data only once when dashboard loads
  useEffect(() => {
    if (user && hasTikTokUsername && !dataRefreshedRef.current) {
      console.log("Refreshing TikTok data on first dashboard load");
      refreshTikTokData();
      dataRefreshedRef.current = true;
    }
  }, [user, hasTikTokUsername]);
  
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <DashboardSidebar />
        <DashboardContent />
      </div>
    </div>
  );
};

export default Dashboard;
