
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RepurposeDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { postData } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold mb-4">Repurpose TikTok Content</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            This is where you'll be able to repurpose your TikTok content for different platforms using AI.
            Coming soon!
          </p>

          {postData ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h2 className="text-lg font-medium mb-2">Post Details</h2>
              <div className="grid gap-2">
                <p><span className="font-medium">Author:</span> {postData.author?.name}</p>
                <p><span className="font-medium">Post text:</span> {postData.content?.text || 'No text'}</p>
                <p><span className="font-medium">Engagement:</span> {postData.engagement?.views?.toLocaleString() || 0} views</p>
                <p><span className="font-medium">Hashtags:</span> {postData.content?.hashtags?.join(', ') || 'None'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-yellow-800 dark:text-yellow-200">
              No post data was provided. Please select a post from the dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepurposeDashboardPage;
