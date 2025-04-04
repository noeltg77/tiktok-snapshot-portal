
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// BrandVoiceCard component for each section
interface BrandVoiceCardProps {
  title: string;
  content: string;
  isEditing: boolean;
  editedContent: string;
  fieldName: string;
  onEdit: () => void;
  onSave: () => void;
  onContentChange: (content: string) => void;
}
const BrandVoiceCard = ({
  title,
  content,
  isEditing,
  editedContent,
  fieldName,
  onEdit,
  onSave,
  onContentChange
}: BrandVoiceCardProps) => {
  return <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isEditing ? <Button variant="ghost" size="sm" onClick={onSave} className="h-8 w-8 p-0">
            <Save className="h-4 w-4" />
          </Button> : <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>}
      </CardHeader>
      <CardContent className="flex-grow pb-6">
        {isEditing ? 
          <textarea 
            className="w-full h-full min-h-[250px] p-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700" 
            value={editedContent} 
            onChange={e => onContentChange(e.target.value)} 
          /> 
          : 
          <div className="text-sm whitespace-pre-wrap h-full min-h-[250px] overflow-y-auto">
            {content}
          </div>
        }
      </CardContent>
    </Card>;
};

// Main Brand Voice Page component
const BrandVoicePage = () => {
  const {
    user,
    profile,
    loading,
    profileLoading
  } = useAuth();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  // Editing states for each section
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Content states to display in the UI
  const [displayContent, setDisplayContent] = useState({
    topics_and_themes: "",
    tone_and_language: "",
    content_structure: "",
    audience_connection: ""
  });

  // Content for each section being edited
  const [editedContent, setEditedContent] = useState({
    topics_and_themes: "",
    tone_and_language: "",
    content_structure: "",
    audience_connection: ""
  });

  // Update content when profile changes
  useEffect(() => {
    if (profile) {
      const content = {
        topics_and_themes: profile.topics_and_themes || "Not Generated",
        tone_and_language: profile.tone_and_language || "Not Generated",
        content_structure: profile.content_structure || "Not Generated",
        audience_connection: profile.audience_connection || "Not Generated"
      };
      setDisplayContent(content);
      setEditedContent(content);
    }
  }, [profile]);

  // Clear progress interval when component unmounts
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  if (loading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleEdit = (section: string) => {
    setEditingSection(section);
    // Initialize edited content with current display content
    setEditedContent(prev => ({
      ...prev,
      [section]: displayContent[section as keyof typeof displayContent]
    }));
  };

  const handleContentChange = (section: string, content: string) => {
    setEditedContent(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handleSave = async (section: string) => {
    if (!user) return;
    setSaving(true);
    try {
      // First update our local state immediately to ensure UI consistency
      const updatedContent = editedContent[section as keyof typeof editedContent];
      setDisplayContent(prev => ({
        ...prev,
        [section]: updatedContent
      }));

      // Then update the database
      const {
        error
      } = await supabase.from('profiles').update({
        [section]: updatedContent
      }).eq('id', user.id);
      
      if (error) throw error;
      setEditingSection(null);
      toast.success("Brand voice section updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update brand voice section");

      // Revert the UI change if the database update failed
      if (profile) {
        setDisplayContent(prev => ({
          ...prev,
          [section]: profile[section as keyof typeof profile] || "Not Generated"
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBrandVoice = async () => {
    if (!user) return;
    setGenerating(true);
    setProgress(0);
    
    // Start progress animation - adjusted for 30 seconds
    // We'll update it more frequently and with smaller increments to make it last ~30 seconds
    // For ~30 seconds we'll do updates every 300ms and increase by ~1% each time
    const interval = setInterval(() => {
      setProgress(prev => {
        // Stop at 95% and wait for actual completion
        if (prev >= 95) {
          return 95;
        }
        // Each step is roughly 1%, which gives us ~95 steps
        // At 300ms per step, that's ~28.5 seconds to reach 95%
        return prev + 1;
      });
    }, 300);
    
    setProgressInterval(interval);
    
    try {
      // Call the webhook with the user ID
      const response = await fetch('https://hook.eu2.make.com/owm2f5i4r21aovc7pfh2kg34481svmrr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update progress to 100% when complete
      setProgress(100);
      
      // Small delay to show 100% progress before fetching updated data
      setTimeout(async () => {
        // Fetch the updated profile data to get the new brand voice content
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Update the UI with the new content
          const updatedContent = {
            topics_and_themes: data.topics_and_themes || "Not Generated",
            tone_and_language: data.tone_and_language || "Not Generated",
            content_structure: data.content_structure || "Not Generated",
            audience_connection: data.audience_connection || "Not Generated"
          };
          
          setDisplayContent(updatedContent);
          setEditedContent(updatedContent);
          toast.success("Brand voice generated successfully!");
        }
        
        setGenerating(false);
        clearInterval(interval);
        setProgressInterval(null);
      }, 500);
      
    } catch (error) {
      console.error('Error generating brand voice:', error);
      toast.error("Failed to generate brand voice");
      setGenerating(false);
      clearInterval(interval);
      setProgressInterval(null);
    }
  };

  return <div className="min-h-screen h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="flex h-full w-full">
        <DashboardSidebar />
        <div className="flex-1 p-8 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Brand Voice</h1>
            <Button onClick={handleGenerateBrandVoice} disabled={generating} className="bg-slate-950 hover:bg-slate-800">
              {generating ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </> : "Generate Brand Voice"}
            </Button>
          </div>
          
          {generating && (
            <div className="mb-6">
              <div className="flex justify-between mb-1 text-sm">
                <span>Generating your brand voice...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
            {/* Topics and Themes Card */}
            <BrandVoiceCard title="Topics and Themes" content={displayContent.topics_and_themes} isEditing={editingSection === "topics_and_themes"} editedContent={editedContent.topics_and_themes} fieldName="topics_and_themes" onEdit={() => handleEdit("topics_and_themes")} onSave={() => handleSave("topics_and_themes")} onContentChange={content => handleContentChange("topics_and_themes", content)} />
            
            {/* Tone and Language Card */}
            <BrandVoiceCard title="Tone and Language" content={displayContent.tone_and_language} isEditing={editingSection === "tone_and_language"} editedContent={editedContent.tone_and_language} fieldName="tone_and_language" onEdit={() => handleEdit("tone_and_language")} onSave={() => handleSave("tone_and_language")} onContentChange={content => handleContentChange("tone_and_language", content)} />
            
            {/* Content Structure Card */}
            <BrandVoiceCard title="Content Structure" content={displayContent.content_structure} isEditing={editingSection === "content_structure"} editedContent={editedContent.content_structure} fieldName="content_structure" onEdit={() => handleEdit("content_structure")} onSave={() => handleSave("content_structure")} onContentChange={content => handleContentChange("content_structure", content)} />
            
            {/* Audience Connection Card */}
            <BrandVoiceCard title="Audience Connection" content={displayContent.audience_connection} isEditing={editingSection === "audience_connection"} editedContent={editedContent.audience_connection} fieldName="audience_connection" onEdit={() => handleEdit("audience_connection")} onSave={() => handleSave("audience_connection")} onContentChange={content => handleContentChange("audience_connection", content)} />
          </div>
        </div>
      </div>
    </div>;
};
export default BrandVoicePage;
