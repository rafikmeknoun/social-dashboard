import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { 
  SocialAccount, 
  SocialPost, 
  AnalyticsOverview, 
  SocialOverview, 
  DateRange, 
  RevenueData,
  ImportBatch,
  Platform
} from '@/types';

// Generate mock posts
function generateMockPosts(): SocialPost[] {
  const platforms: Array<'facebook' | 'instagram' | 'youtube' | 'tiktok'> = ['facebook', 'instagram', 'youtube', 'tiktok'];
  const postTypes: Array<'image' | 'video' | 'carousel' | 'story'> = ['image', 'video', 'carousel', 'story'];
  const posts: SocialPost[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    posts.push({
      id: i,
      social_account_id: platforms.indexOf(platform) + 1,
      post_id: `post_${i}`,
      content: `Publication exemple ${i} sur ${platform}. Voici un contenu de démonstration pour tester l'interface du dashboard.`,
      media_url: `https://picsum.photos/400/300?random=${i}`,
      post_type: postTypes[Math.floor(Math.random() * postTypes.length)],
      published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      likes_count: Math.floor(Math.random() * 5000) + 100,
      comments_count: Math.floor(Math.random() * 500) + 10,
      shares_count: Math.floor(Math.random() * 200) + 5,
      views_count: Math.floor(Math.random() * 50000) + 1000,
      reach_count: Math.floor(Math.random() * 30000) + 500,
      engagement_rate: Math.random() * 10 + 1,
      revenue: Math.floor(Math.random() * 100) + 10,
    });
  }
  
  return posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

// Generate mock revenue data
function generateMockRevenueData(): RevenueData[] {
  const platforms: Platform[] = ['facebook', 'instagram', 'youtube', 'tiktok', 'adsense'];
  const revenueData: RevenueData[] = [];
  
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    platforms.forEach(platform => {
      const baseRevenueMap: Record<string, number> = {
        facebook: 50,
        instagram: 40,
        youtube: 120,
        tiktok: 30,
        adsense: 80,
        twitter: 15,
        linkedin: 25,
      };
      const baseRevenue = baseRevenueMap[platform] || 20;
      
      revenueData.push({
        id: revenueData.length + 1,
        platform,
        date: date.toISOString().split('T')[0],
        revenue: baseRevenue + Math.random() * baseRevenue * 0.5,
        currency: 'EUR',
        impressions: Math.floor(Math.random() * 50000) + 10000,
        clicks: Math.floor(Math.random() * 1000) + 100,
        ctr: Math.random() * 5 + 0.5,
        cpm: Math.random() * 10 + 2,
        estimated_earnings: baseRevenue + Math.random() * baseRevenue * 0.5,
        source: 'api',
      });
    });
  }
  
  return revenueData;
}

interface DataContextType {
  accounts: SocialAccount[];
  posts: SocialPost[];
  revenueData: RevenueData[];
  socialOverview: SocialOverview;
  analyticsOverview: AnalyticsOverview;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refreshData: () => void;
  importBatches: ImportBatch[];
  addImportBatch: (batch: ImportBatch) => void;
  addRevenueData: (data: RevenueData[]) => void;
  addAccount: (account: Omit<SocialAccount, 'id'>) => void;
  removeAccount: (id: number) => void;
  getRevenueByPlatform: (platform: Platform) => RevenueData[];
  getTotalRevenue: () => number;
  getRevenueByDateRange: (startDate: string, endDate: string) => RevenueData[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const mockAccounts: SocialAccount[] = [
  { id: 1, platform: 'facebook', account_id: 'fb_123', account_name: 'Ma Page Facebook', account_username: 'mapagefb', profile_picture: null, followers_count: 45230, is_active: true },
  { id: 2, platform: 'instagram', account_id: 'ig_456', account_name: 'Mon Instagram', account_username: 'moninstagram', profile_picture: null, followers_count: 28900, is_active: true },
  { id: 3, platform: 'youtube', account_id: 'yt_789', account_name: 'Ma Chaîne YouTube', account_username: 'machaineyt', profile_picture: null, followers_count: 15600, is_active: true },
  { id: 4, platform: 'tiktok', account_id: 'tt_012', account_name: 'Mon TikTok', account_username: 'montiktok', profile_picture: null, followers_count: 32100, is_active: true },
];

const mockAnalyticsOverview: AnalyticsOverview = {
  total_sessions: 45230,
  total_users: 28900,
  total_pageviews: 156800,
  avg_bounce_rate: 0.423,
  avg_session_duration: 185,
  new_users: 12300,
  returning_users: 16600,
  conversions: 450,
  revenue: 12500,
  traffic_sources: {
    'Organic Search': 15800,
    'Direct': 11300,
    'Social': 9000,
    'Referral': 6800,
    'Email': 2330,
  },
  top_pages: [
    { path: '/', title: 'Accueil', views: 45230 },
    { path: '/produits', title: 'Produits', views: 23100 },
    { path: '/blog', title: 'Blog', views: 18900 },
    { path: '/contact', title: 'Contact', views: 12300 },
    { path: '/a-propos', title: 'À propos', views: 8900 },
  ],
  devices: {
    desktop: 20300,
    mobile: 20300,
    tablet: 4530,
  },
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>(mockAccounts);
  const [posts, setPosts] = useState<SocialPost[]>(generateMockPosts());
  const [revenueData, setRevenueData] = useState<RevenueData[]>(generateMockRevenueData());
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const socialOverview = useMemo((): SocialOverview => {
    const totalFollowers = accounts.reduce((sum, a) => sum + a.followers_count, 0);
    const totalViews = posts.reduce((sum, p) => sum + p.views_count, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.likes_count, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments_count, 0);
    const totalShares = posts.reduce((sum, p) => sum + p.shares_count, 0);
    const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
    
    const platforms: SocialOverview['platforms'] = {};
    
    accounts.forEach(account => {
      const accountPosts = posts.filter(p => p.social_account_id === account.id);
      const views = accountPosts.reduce((sum, p) => sum + p.views_count, 0);
      const engagement = accountPosts.reduce((sum, p) => sum + p.engagement_rate, 0) / (accountPosts.length || 1);
      const revenue = revenueData
        .filter(r => r.platform === account.platform)
        .reduce((sum, r) => sum + r.revenue, 0);
      
      platforms[account.platform] = {
        followers: account.followers_count,
        views,
        reach: views,
        engagement_rate: engagement,
        revenue,
      };
    });
    
    return {
      total_followers: totalFollowers,
      total_views: totalViews,
      total_reach: totalViews,
      total_engagement: totalLikes + totalComments + totalShares,
      total_likes: totalLikes,
      total_comments: totalComments,
      total_shares: totalShares,
      total_revenue: totalRevenue,
      platforms,
    };
  }, [accounts, posts, revenueData]);

  const refreshData = useCallback(() => {
    setPosts(generateMockPosts());
    setRevenueData(generateMockRevenueData());
  }, []);

  const addImportBatch = useCallback((batch: ImportBatch) => {
    setImportBatches(prev => [batch, ...prev]);
  }, []);

  const addRevenueData = useCallback((data: RevenueData[]) => {
    setRevenueData(prev => [...data, ...prev]);
  }, []);

  const addAccount = useCallback((account: Omit<SocialAccount, 'id'>) => {
    const newAccount: SocialAccount = {
      ...account,
      id: Math.max(...accounts.map(a => a.id), 0) + 1,
    };
    setAccounts(prev => [...prev, newAccount]);
  }, [accounts]);

  const removeAccount = useCallback((id: number) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  const getRevenueByPlatform = useCallback((platform: Platform) => {
    return revenueData.filter(r => r.platform === platform);
  }, [revenueData]);

  const getTotalRevenue = useCallback(() => {
    return revenueData.reduce((sum, r) => sum + r.revenue, 0);
  }, [revenueData]);

  const getRevenueByDateRange = useCallback((startDate: string, endDate: string) => {
    return revenueData.filter(r => r.date >= startDate && r.date <= endDate);
  }, [revenueData]);

  return (
    <DataContext.Provider value={{
      accounts,
      posts,
      revenueData,
      socialOverview,
      analyticsOverview: mockAnalyticsOverview,
      dateRange,
      setDateRange,
      refreshData,
      importBatches,
      addImportBatch,
      addRevenueData,
      addAccount,
      removeAccount,
      getRevenueByPlatform,
      getTotalRevenue,
      getRevenueByDateRange,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
