export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'adsense';

export interface SocialAccount {
  id: number;
  platform: Platform;
  account_id: string;
  account_name: string;
  account_username: string | null;
  profile_picture: string | null;
  followers_count: number;
  is_active: boolean;
}

export interface SocialPost {
  id: number;
  social_account_id: number;
  post_id: string;
  content: string | null;
  media_url: string | null;
  post_type: 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'short' | 'text' | 'link';
  published_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  reach_count: number;
  engagement_rate: number;
  revenue?: number;
  social_account?: SocialAccount;
}

export interface RevenueData {
  id: number;
  platform: Platform;
  date: string;
  revenue: number;
  currency: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpm?: number;
  estimated_earnings?: number;
  source: 'api' | 'csv' | 'manual';
  metadata?: Record<string, unknown>;
}

export interface PlatformKPIs {
  followers: number;
  views: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  watch_time_minutes: number;
  average_view_duration: number;
  revenue: number;
  posts_count: number;
  stories_count: number;
  videos_count: number;
  new_followers: number;
  unfollows: number;
  profile_visits: number;
  website_clicks: number;
  email_contacts: number;
  get_directions_clicks: number;
  phone_call_clicks: number;
  text_message_clicks: number;
}

export interface YouTubeKPIs extends PlatformKPIs {
  subscribers_gained: number;
  subscribers_lost: number;
  estimated_minutes_watched: number;
  average_view_percentage: number;
  annotation_click_through_rate: number;
  card_clicks: number;
  card_teaser_clicks: number;
  dislikes: number;
  red_views: number;
  red_watch_time_minutes: number;
}

export interface FacebookKPIs extends PlatformKPIs {
  page_engaged_users: number;
  page_consumptions: number;
  page_consumptions_unique: number;
  page_negative_feedback: number;
  page_negative_feedback_unique: number;
  page_fan_adds: number;
  page_fan_removes: number;
  page_impressions_organic: number;
  page_impressions_paid: number;
  page_impressions_viral: number;
  post_engagements: number;
  reactions: number;
}

export interface InstagramKPIs extends PlatformKPIs {
  accounts_engaged: number;
  content_interactions: number;
  content_shares: number;
  content_saved: number;
  reels_avg_watch_time: number;
  reels_plays: number;
  reels_total_plays: number;
  stories_exits: number;
  stories_replies: number;
  stories_taps_back: number;
  stories_taps_forward: number;
}

export interface TikTokKPIs extends PlatformKPIs {
  profile_views: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
  following: number;
  videos: number;
  video_views: number;
  live_views: number;
  diamonds: number;
  gifts_received: number;
}

export interface AdSenseKPIs {
  date: string;
  page_views: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  rpm: number;
  estimated_earnings: number;
  coverage: number;
}

export interface AnalyticsOverview {
  total_sessions: number;
  total_users: number;
  total_pageviews: number;
  avg_bounce_rate: number;
  avg_session_duration: number;
  new_users: number;
  returning_users: number;
  conversions: number;
  revenue: number;
  traffic_sources: Record<string, number>;
  top_pages: Array<{ path: string; title: string; views: number }>;
  devices: Record<string, number>;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SocialOverview {
  total_followers: number;
  total_views: number;
  total_reach: number;
  total_engagement: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_revenue: number;
  platforms: Record<string, {
    followers: number;
    views: number;
    reach: number;
    engagement_rate: number;
    revenue: number;
  }>;
}

export interface ImportBatch {
  id: string;
  platform: Platform;
  fileName: string;
  fileType: 'csv' | 'excel';
  rowCount: number;
  importedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  completedAt?: string;
  errors?: string[];
}

export interface CSVColumnMapping {
  csvColumn: string;
  field: string;
}
