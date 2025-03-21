
"use client";

import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Link as LinkIcon,
  Eye,
  Hash,
  Sparkles,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface SocialCardProps {
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
    timeAgo?: string;
  };
  content?: {
    text?: string;
    image?: string;
    hashtags?: string[];
    link?: {
      title?: string;
      description?: string;
      icon?: React.ReactNode;
    };
    videoUrl?: string; // Add videoUrl property
  };
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    bookmarks?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  className?: string;
  context?: 'dashboard' | 'hashtag'; // New prop to differentiate between contexts
}

export function SocialCard({
  author,
  content,
  engagement,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMore,
  className,
  context = 'dashboard' // Default to dashboard context
}: SocialCardProps) {
  const navigate = useNavigate();
  // Ensure hashtags is always an array
  const hashtags = Array.isArray(content?.hashtags) ? content.hashtags : [];

  // Function to handle video click
  const handleVideoClick = () => {
    if (content?.videoUrl) {
      window.open(content.videoUrl, '_blank');
    }
  };
  
  // Function to handle the sparkle button click in dashboard context
  const handleDashboardSparkleClick = () => {
    // Navigate to the repurpose page for dashboard posts
    navigate('/repurpose-dashboard', { 
      state: { 
        postData: { author, content, engagement } 
      } 
    });
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-3xl shadow-xl",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-2xl hover:-translate-y-1",
        "hover:border-blue-300 dark:hover:border-blue-700",
        className
      )}
    >
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div className="p-6">
          {/* Author section - Kept at the top */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={author?.avatar}
                alt={author?.name}
                className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-zinc-800 transition-transform hover:scale-110"
              />
              <div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {author?.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  @{author?.username} · {author?.timeAgo}
                </p>
              </div>
            </div>
            
            {/* Check context and render appropriate sparkle button */}
            {context === 'dashboard' ? (
              // Dashboard sparkle button - Direct navigation
              <button
                type="button"
                onClick={handleDashboardSparkleClick}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-purple-500 hover:text-purple-600"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            ) : (
              // Hashtag search sparkle button - Dialog
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-purple-500 hover:text-purple-600"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>AI Content Repurposing</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-500">
                      This feature will allow you to repurpose this TikTok content using AI.
                      Coming soon!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Engagement section - All stats now non-clickable except comments */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Like stat - Now non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-rose-600 transition-transform hover:scale-110">
                <Heart
                  className={cn(
                    "w-5 h-5",
                    engagement?.isLiked && "fill-current"
                  )}
                />
                <span>{engagement?.likes}</span>
              </div>
              
              <button
                type="button"
                onClick={onComment}
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-all hover:scale-110"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{engagement?.comments}</span>
              </button>
              
              {/* Share stat - Non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-green-500 transition-transform hover:scale-110">
                <Share className="w-5 h-5" />
                <span>{engagement?.shares}</span>
              </div>
              
              {/* Views stat - Non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-purple-500 transition-transform hover:scale-110">
                <Eye className="w-5 h-5" />
                <span>{engagement?.views?.toLocaleString() || 0}</span>
              </div>
              
              {/* Bookmark stat - Now non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-yellow-500 transition-transform hover:scale-110">
                <Bookmark
                  className={cn(
                    "w-5 h-5",
                    engagement?.isBookmarked && "fill-current"
                  )}
                />
                <span>{engagement?.bookmarks}</span>
              </div>
            </div>
          </div>

          {/* Image section - Make it clickable with cursor-pointer */}
          {content?.image && (
            <div 
              className="mb-4 rounded-xl overflow-hidden cursor-pointer relative group transform transition-transform duration-300 hover:scale-[1.02]"
              onClick={handleVideoClick}
            >
              <AspectRatio ratio={9/16} className="bg-muted">
                <img
                  src={content.image}
                  alt="Post content"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* TikTok logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center transform transition-transform group-hover:scale-110">
                    <img 
                      src="/lovable-uploads/dbdf8e12-6dc7-40e5-87dd-0c06d15e586e.png" 
                      alt="TikTok" 
                      className="w-9 h-9"
                    />
                  </div>
                </div>
              </AspectRatio>
            </div>
          )}

          {/* Link preview */}
          {content?.link && (
            <div className="mb-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white dark:bg-zinc-700 rounded-xl">
                    {content.link.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {content.link.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {content.link.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content text section */}
          {content?.text && (
            <p className="text-zinc-600 dark:text-zinc-300">
              {content.text}
            </p>
          )}
          
          {/* Hashtags section */}
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs transition-all hover:bg-blue-200 dark:hover:bg-blue-800 hover:scale-105"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
