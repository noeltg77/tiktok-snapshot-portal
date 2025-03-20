
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TikTokUsernameForm = () => {
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile, profileLoading, hasTikTokUsername } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to dashboard if user already has a TikTok username
  useEffect(() => {
    if (!profileLoading && hasTikTokUsername) {
      navigate('/dashboard', { replace: true });
    }
  }, [profileLoading, hasTikTokUsername, navigate]);

  // Redirect to auth if no user
  useEffect(() => {
    if (!user && !profileLoading) {
      navigate('/auth', { replace: true });
    }
  }, [user, profileLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tiktok_username: tiktokUsername })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "TikTok username saved",
        description: "Your TikTok username has been saved successfully.",
      });
      
      // Update local auth context first to ensure state consistency
      setTimeout(() => {
        console.log("Redirecting to dashboard after saving username");
        // Use window.location for a hard redirect that forces a fresh load
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error: any) {
      console.error("Error saving TikTok username:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving your TikTok username.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              TikTok Username
            </CardTitle>
            <CardDescription className="text-center">
              Enter your TikTok username to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tiktok-username">TikTok Username</Label>
                <Input
                  id="tiktok-username"
                  placeholder="@yourusername"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !tiktokUsername.trim()}
              >
                {isSubmitting ? "Saving..." : "Continue to Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TikTokUsernameForm;
