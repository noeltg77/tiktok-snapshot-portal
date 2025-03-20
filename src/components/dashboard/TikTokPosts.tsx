
import React from "react";
import { SocialCard } from "@/components/ui/social-card";
import { Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TikTokPosts = () => {
  const { profile } = useAuth();
  
  const handleAction = (id: number, action: string) => {
    console.log(`Post ${id}: ${action}`);
  };

  // Sample posts for now - will be replaced with actual TikTok data later
  const posts = [
    {
      id: 1,
      author: {
        name: profile?.tiktok_username || "User",
        username: profile?.tiktok_username?.replace('@', '') || "user",
        avatar: profile?.avatar_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=600&crop=1",
        timeAgo: "2h ago",
      },
      content: {
        text: "Check out my latest TikTok video! #trending #viral",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      },
      engagement: {
        likes: 1248,
        comments: 87,
        shares: 32,
        isLiked: false,
        isBookmarked: false,
      },
    },
    {
      id: 2,
      author: {
        name: profile?.tiktok_username || "User",
        username: profile?.tiktok_username?.replace('@', '') || "user",
        avatar: profile?.avatar_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=600&crop=1",
        timeAgo: "3d ago",
      },
      content: {
        text: "This tutorial on how to grow your TikTok followers is a game changer!",
        image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800",
        link: {
          title: "TikTok Growth Strategy",
          description: "Learn how to increase your followers and engagement",
          icon: <LinkIcon className="w-5 h-5 text-blue-500" />,
        },
      },
      engagement: {
        likes: 3542,
        comments: 142,
        shares: 89,
        isLiked: true,
        isBookmarked: true,
      },
    },
  ];

  return (
    <div className="space-y-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
      <div className="space-y-6">
        {posts.map(post => (
          <SocialCard
            key={post.id}
            author={post.author}
            content={post.content}
            engagement={post.engagement}
            onLike={() => handleAction(post.id, 'liked')}
            onComment={() => handleAction(post.id, 'commented')}
            onShare={() => handleAction(post.id, 'shared')}
            onBookmark={() => handleAction(post.id, 'bookmarked')}
            onMore={() => handleAction(post.id, 'more')}
          />
        ))}
      </div>
    </div>
  );
};

export default TikTokPosts;
