import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Instagram, Users, Eye, Heart, DollarSign, Play, Image, Film, 
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import type { InstagramKPIs } from '@/types';

// Generate mock Instagram KPIs data
function generateInstagramKPIs(days: number): (InstagramKPIs & { date: string })[] {
  const data: (InstagramKPIs & { date: string })[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const views = Math.floor(Math.random() * 6000) + 2500;
    
    data.push({
      date: date.toISOString().split('T')[0],
      followers: 28900 + Math.floor(Math.random() * 400 - 150),
      views,
      reach: views * 0.75,
      impressions: views * 1.8,
      engagement_rate: Math.random() * 7 + 2.5,
      likes: Math.floor(views * 0.07),
      comments: Math.floor(views * 0.015),
      shares: Math.floor(views * 0.008),
      saves: Math.floor(views * 0.025),
      clicks: Math.floor(views * 0.035),
      watch_time_minutes: views * 0.25,
      average_view_duration: 30 + Math.random() * 45,
      revenue: Math.random() * 60 + 15,
      posts_count: Math.floor(Math.random() * 2) + (Math.random() > 0.5 ? 1 : 0),
      stories_count: Math.floor(Math.random() * 5) + 2,
      videos_count: Math.floor(Math.random() * 2),
      new_followers: Math.floor(Math.random() * 40) + 8,
      unfollows: Math.floor(Math.random() * 8) + 2,
      profile_visits: Math.floor(views * 0.12),
      website_clicks: Math.floor(views * 0.025),
      email_contacts: Math.floor(Math.random() * 3),
      get_directions_clicks: Math.floor(Math.random() * 2),
      phone_call_clicks: Math.floor(Math.random() * 3),
      text_message_clicks: Math.floor(Math.random() * 2),
      accounts_engaged: Math.floor(views * 0.18),
      content_interactions: Math.floor(views * 0.12),
      content_shares: Math.floor(views * 0.008),
      content_saved: Math.floor(views * 0.025),
      reels_avg_watch_time: 8 + Math.random() * 15,
      reels_plays: Math.floor(views * 0.4),
      reels_total_plays: Math.floor(views * 0.45),
      stories_exits: Math.floor(Math.random() * 50) + 20,
      stories_replies: Math.floor(Math.random() * 15) + 3,
      stories_taps_back: Math.floor(Math.random() * 30) + 10,
      stories_taps_forward: Math.floor(Math.random() * 80) + 30,
    });
  }
  
  return data;
}

// const COLORS = ['#E4405F', '#833AB4', '#F77737', '#FCAF45', '#FFDC80'];

export default function InstagramDashboard() {
  const { dateRange, getRevenueByPlatform } = useData();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);
  
  const kpisData = useMemo(() => generateInstagramKPIs(timeRange), [timeRange, refreshing]);
  
  const revenueData = useMemo(() => {
    return getRevenueByPlatform('instagram')
      .filter(r => r.date >= dateRange.startDate && r.date <= dateRange.endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getRevenueByPlatform, dateRange, refreshing]);
  
  const totals = useMemo(() => {
    return kpisData.reduce((acc, day) => ({
      followers: day.followers,
      views: acc.views + day.views,
      reach: acc.reach + day.reach,
      impressions: acc.impressions + day.impressions,
      likes: acc.likes + day.likes,
      comments: acc.comments + day.comments,
      shares: acc.shares + day.shares,
      saves: acc.saves + day.saves,
      revenue: acc.revenue + day.revenue,
      new_followers: acc.new_followers + day.new_followers,
      profile_visits: acc.profile_visits + day.profile_visits,
      website_clicks: acc.website_clicks + day.website_clicks,
      accounts_engaged: acc.accounts_engaged + day.accounts_engaged,
      posts: acc.posts + day.posts_count,
      stories: acc.stories + day.stories_count,
      reels_plays: acc.reels_plays + day.reels_plays,
    }), {
      followers: 0,
      views: 0,
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      revenue: 0,
      new_followers: 0,
      profile_visits: 0,
      website_clicks: 0,
      accounts_engaged: 0,
      posts: 0,
      stories: 0,
      reels_plays: 0,
    });
  }, [kpisData]);
  
  const engagementData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      engagement: parseFloat(day.engagement_rate.toFixed(2)),
      likes: day.likes,
      comments: day.comments,
      saves: day.saves,
      shares: day.shares,
    }));
  }, [kpisData]);
  
  const contentTypeData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      posts: day.posts_count,
      stories: day.stories_count,
      reels: day.videos_count,
    }));
  }, [kpisData]);
  
  const reelsData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      plays: day.reels_plays,
      avg_watch: parseFloat(day.reels_avg_watch_time.toFixed(1)),
    }));
  }, [kpisData]);
  
  const storiesData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      exits: day.stories_exits,
      replies: day.stories_replies,
      taps_back: day.stories_taps_back,
      taps_forward: day.stories_taps_forward,
    }));
  }, [kpisData]);
  
  const revenueChartData = useMemo(() => {
    return revenueData.map(r => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      revenue: r.revenue,
    }));
  }, [revenueData]);
  
  const contentDistribution = useMemo(() => [
    { name: 'Posts', value: totals.posts, color: '#E4405F' },
    { name: 'Stories', value: totals.stories, color: '#833AB4' },
    { name: 'Reels', value: Math.floor(totals.views * 0.4 / 1000), color: '#F77737' },
  ], [totals]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
            <Instagram className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instagram</h1>
            <p className="text-muted-foreground">Tableau de bord détaillé de votre compte Instagram</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 7 | 30 | 90)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === days 
                    ? 'bg-white text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {days}j
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.followers.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{totals.new_followers} nouveaux
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portée</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.reach.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{(totals.reach / timeRange / 1000).toFixed(1)}k/jour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totals.likes + totals.comments + totals.saves).toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {((totals.likes + totals.comments + totals.saves) / totals.views * 100).toFixed(1)}% taux
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.revenue.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {(totals.revenue / timeRange).toFixed(2)} €/jour
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portée & Impressions</CardTitle>
                <CardDescription>Évolution de la portée et des impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={kpisData.map(d => ({
                    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    portee: d.reach,
                    impressions: d.impressions,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="portee" stackId="1" stroke="#E4405F" fill="#E4405F" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="impressions" stackId="1" stroke="#833AB4" fill="#833AB4" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution du contenu</CardTitle>
                <CardDescription>Répartition par type de contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Comptes engagés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.accounts_engaged.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Visites profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.profile_visits.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Clics site web</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.website_clicks.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lectures Reels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.reels_plays.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taux d'engagement</CardTitle>
              <CardDescription>Évolution du taux d'engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="engagement" stroke="#E4405F" strokeWidth={2} name="Taux d'engagement (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interactions</CardTitle>
                <CardDescription>J'aime, commentaires, sauvegardes et partages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="likes" fill="#E4405F" name="J'aime" />
                    <Bar dataKey="comments" fill="#833AB4" name="Commentaires" />
                    <Bar dataKey="saves" fill="#F77737" name="Sauvegardes" />
                    <Bar dataKey="shares" fill="#FCAF45" name="Partages" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance des interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">J'aime</span>
                    <span className="font-bold">{totals.likes.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Commentaires</span>
                    <span className="font-bold">{totals.comments.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sauvegardes</span>
                    <span className="font-bold">{totals.saves.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Partages</span>
                    <span className="font-bold">{totals.shares.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Total interactions</span>
                    <span className="font-bold text-lg">{(totals.likes + totals.comments + totals.saves + totals.shares).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publication de contenu</CardTitle>
              <CardDescription>Posts, stories et reels publiés</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={contentTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#E4405F" name="Posts" />
                  <Bar dataKey="stories" fill="#833AB4" name="Stories" />
                  <Bar dataKey="reels" fill="#F77737" name="Reels" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance des Reels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reelsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="plays" stroke="#E4405F" strokeWidth={2} name="Lectures" />
                    <Line yAxisId="right" type="monotone" dataKey="avg_watch" stroke="#833AB4" strokeWidth={2} name="Temps moyen (sec)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé du contenu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image className="h-5 w-5 text-pink-600" />
                      <span>Posts</span>
                    </div>
                    <span className="font-bold">{totals.posts}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Play className="h-5 w-5 text-purple-600" />
                      <span>Stories</span>
                    </div>
                    <span className="font-bold">{totals.stories}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Film className="h-5 w-5 text-orange-600" />
                      <span>Reels</span>
                    </div>
                    <span className="font-bold">{totals.reels_plays.toLocaleString('fr-FR')} lectures</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactions Stories</CardTitle>
              <CardDescription>Réponses, taps et sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={storiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="replies" fill="#E4405F" name="Réponses" />
                  <Bar dataKey="taps_back" fill="#833AB4" name="Taps arrière" />
                  <Bar dataKey="taps_forward" fill="#F77737" name="Taps avant" />
                  <Bar dataKey="exits" fill="#9CA3AF" name="Sorties" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.stories}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Réponses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpisData.reduce((acc, d) => acc + d.stories_replies, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taps arrière</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpisData.reduce((acc, d) => acc + d.stories_taps_back, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sorties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpisData.reduce((acc, d) => acc + d.stories_exits, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus</CardTitle>
              <CardDescription>Évolution des revenus sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#E4405F" 
                    fill="#E4405F" 
                    fillOpacity={0.6}
                    name="Revenus (€)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Revenu total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totals.revenue.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenu moyen/jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(totals.revenue / timeRange).toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenu par abonné</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(totals.revenue / totals.followers * 1000).toFixed(2)} €
                </div>
                <p className="text-sm text-muted-foreground mt-2">Par 1000 abonnés</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
