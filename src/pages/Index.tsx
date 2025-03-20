
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">TikTok Data Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          Access and analyze TikTok data for your accounts and trending videos
        </p>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
