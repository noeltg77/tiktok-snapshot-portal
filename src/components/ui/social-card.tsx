
"use client";

import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Link as LinkIcon,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
    link?: {
      title?: string;
      description?: string;
      icon?: React.ReactNode;
    };
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
  className
}: SocialCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-3xl shadow-xl",
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
                className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-zinc-800"
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
            <button
              type="button"
              onClick={onMore}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Engagement section - All stats now non-clickable except comments */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Like stat - Now non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-rose-600">
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
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{engagement?.comments}</span>
              </button>
              
              {/* Share stat - Non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-green-500">
                <Share className="w-5 h-5" />
                <span>{engagement?.shares}</span>
              </div>
              
              {/* Views stat - Non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-purple-500">
                <Eye className="w-5 h-5" />
                <span>{engagement?.views?.toLocaleString() || 0}</span>
              </div>
              
              {/* Bookmark stat - Now non-clickable and colored */}
              <div className="flex items-center gap-1 text-sm text-yellow-500">
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

          {/* Image section - Now third */}
          {content?.image && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <AspectRatio ratio={9/16} className="bg-muted">
                <img
                  src={content.image}
                  alt="Post content"
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
          )}

          {/* Link preview */}
          {content?.link && (
            <div className="mb-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
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

          {/* Content text section - Now last */}
          {content?.text && (
            <p className="text-zinc-600 dark:text-zinc-300">
              {content.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
