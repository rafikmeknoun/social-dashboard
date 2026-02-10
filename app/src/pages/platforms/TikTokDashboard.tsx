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
  Music, Users, Eye, Heart, DollarSign, Play, Gift, 
  ArrowUpRight, RefreshCw, Crown
} from 'lucide-react';
import type { TikTokKPIs } from '@/types';

// Generate mock TikTok KPIs data
function generateTikTokKPIs(days: number): (TikTokKPIs & { date: string })[] {
  const data: (TikTokKPIs & { date: string })[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const videoViews = Math.floor(Math.random() * 15000) + 8000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      followers: 32100 + Math.floor(Math.random() * 600 - 200),
      views: videoViews,
      reach: videoViews * 0.85,
      impressions: videoViews * 2.2,
      engagement_rate: Math.random() * 12 + 4,
      likes: Math.floor(videoViews * 0.09),
      comments: Math.floor(videoViews * 0.012),
      shares: Math.floor(videoViews * 0.018),
      saves: Math.floor(videoViews * 0.035),
      clicks: Math.floor(videoViews * 0.025),
      watch_time_minutes: videoViews * 0.4,
      average_view_duration: 25 + Math.random() * 35,
      revenue: Math.random() * 45 + 10,
      posts_count: Math.floor(Math.random() * 3) + 1,
      stories_count: 0,
      videos_count: Math.floor(Math.random() * 3) + 1,
      new_followers: Math.floor(Math.random() * 80) + 15,
      unfollows: Math.floor(Math.random() * 12) + 3,
      profile_visits: Math.floor(videoViews * 0.15),
      website_clicks: Math.floor(videoViews * 0.018),
      email_contacts: 0,
      get_directions_clicks: 0,
      phone_call_clicks: 0,
      text_message_clicks: 0,
      profile_views: Math.floor(videoViews * 0.15),
      following: 850,
      videos: Math.floor(Math.random() * 3) + 1,
      video_views: videoViews,
      live_views: Math.floor(Math.random() * 2000) + 500,
      diamonds: Math.floor(Math.random() * 500) + 100,
      gifts_received: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  return data;
}

// const COLORS = ['#000000', '#25F4EE', '#FE2C55', '#FFFFFF', '#161823'];

export default function TikTokDashboard() {
  const { dateRange, getRevenueByPlatform } = useData();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);
  
  const kpisData = useMemo(() => generateTikTokKPIs(timeRange), [timeRange, refreshing]);
  
  const revenueData = useMemo(() => {
    return getRevenueByPlatform('tiktok')
      .filter(r => r.date >= dateRange.startDate && r.date <= dateRange.endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getRevenueByPlatform, dateRange, refreshing]);
  
  const totals = useMemo(() => {
    return kpisData.reduce((acc, day) => ({
      followers: day.followers,
      views: acc.views + day.views,
      likes: acc.likes + day.likes,
      comments: acc.comments + day.comments,
      shares: acc.shares + day.shares,
      revenue: acc.revenue + day.revenue,
      new_followers: acc.new_followers + day.new_followers,
      profile_views: acc.profile_views + day.profile_views,
      videos: acc.videos + day.videos,
      live_views: acc.live_views + day.live_views,
      diamonds: acc.diamonds + day.diamonds,
      gifts_received: acc.gifts_received + day.gifts_received,
    }), {
      followers: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      revenue: 0,
      new_followers: 0,
      profile_views: 0,
      videos: 0,
      live_views: 0,
      diamonds: 0,
      gifts_received: 0,
    });
  }, [kpisData]);
  
  const viewsData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      video_views: day.video_views,
      live_views: day.live_views,
    }));
  }, [kpisData]);
  
  const engagementData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      engagement: parseFloat(day.engagement_rate.toFixed(2)),
      likes: day.likes,
      comments: day.comments,
      shares: day.shares,
    }));
  }, [kpisData]);
  
  const followersData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      gained: day.new_followers,
      lost: day.unfollows,
      net: day.new_followers - day.unfollows,
    }));
  }, [kpisData]);
  
  const liveData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      views: day.live_views,
      diamonds: day.diamonds,
      gifts: day.gifts_received,
    }));
  }, [kpisData]);
  
  const revenueChartData = useMemo(() => {
    return revenueData.map(r => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      revenue: r.revenue,
    }));
  }, [revenueData]);
  
  const trafficSources = useMemo(() => [
    { name: 'Pour vous', value: 45, color: '#FE2C55' },
    { name: 'Abonnements', value: 25, color: '#25F4EE' },
    { name: 'Recherche', value: 15, color: '#000000' },
    { name: 'Profil', value: 10, color: '#161823' },
    { name: 'Autre', value: 5, color: '#999999' },
  ], []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center">
            <Music className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TikTok</h1>
            <p className="text-muted-foreground">Tableau de bord détaillé de votre compte TikTok</p>
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
            <CardTitle className="text-sm font-medium">Vues vidéos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.views.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{(totals.views / timeRange / 1000).toFixed(1)}k/jour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">J'aime</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.likes.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {((totals.likes / totals.views) * 100).toFixed(1)}% taux
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
          <TabsTrigger value="views">Vues</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vues vidéos vs Live</CardTitle>
                <CardDescription>Évolution des vues sur la période</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="video_views" stackId="1" stroke="#000000" fill="#000000" fillOpacity={0.8} name="Vues vidéos" />
                    <Area type="monotone" dataKey="live_views" stackId="1" stroke="#FE2C55" fill="#FE2C55" fillOpacity={0.6} name="Vues Live" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sources de trafic</CardTitle>
                <CardDescription>D'où viennent vos spectateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
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
                <CardTitle className="text-sm">Vidéos publiées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.videos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vues Live</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.live_views.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Commentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.comments.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Partages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.shares.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des vues</CardTitle>
              <CardDescription>Vues vidéos et live sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="video_views" stroke="#000000" strokeWidth={2} name="Vues vidéos" />
                  <Line type="monotone" dataKey="live_views" stroke="#FE2C55" strokeWidth={2} name="Vues Live" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visites de profil</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={kpisData.map(d => ({
                    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    visits: d.profile_views,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visits" stroke="#25F4EE" fill="#25F4EE" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance des vidéos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total vues</span>
                    <span className="font-bold">{totals.views.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Vues moyennes/vidéo</span>
                    <span className="font-bold">{Math.floor(totals.views / (totals.videos || 1)).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Vues Live</span>
                    <span className="font-bold">{totals.live_views.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Visites profil</span>
                    <span className="font-bold">{totals.profile_views.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
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
                  <Line type="monotone" dataKey="engagement" stroke="#FE2C55" strokeWidth={2} name="Taux d'engagement (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interactions</CardTitle>
                <CardDescription>J'aime, commentaires et partages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="likes" fill="#FE2C55" name="J'aime" />
                    <Bar dataKey="comments" fill="#25F4EE" name="Commentaires" />
                    <Bar dataKey="shares" fill="#000000" name="Partages" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Croissance des abonnés</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={followersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="gained" fill="#22c55e" name="Nouveaux" />
                    <Bar dataKey="lost" fill="#ef4444" name="Perdus" />
                    <Bar dataKey="net" fill="#3b82f6" name="Net" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des Lives</CardTitle>
              <CardDescription>Vues, diamants et cadeaux reçus</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={liveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="views" fill="#FE2C55" name="Vues Live" />
                  <Bar yAxisId="right" dataKey="diamonds" fill="#25F4EE" name="Diamants" />
                  <Bar yAxisId="right" dataKey="gifts" fill="#FFD700" name="Cadeaux" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vues Live
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totals.live_views.toLocaleString('fr-FR')}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {(totals.live_views / timeRange).toFixed(0)} vues/jour en moyenne
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-cyan-400" />
                  Diamants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-500">{totals.diamonds.toLocaleString('fr-FR')}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Revenu estimé: {(totals.diamonds * 0.005).toFixed(2)} €
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-500" />
                  Cadeaux reçus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{totals.gifts_received}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {(totals.gifts_received / timeRange).toFixed(1)} cadeaux/jour
                </p>
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
                    stroke="#000000" 
                    fill="#000000" 
                    fillOpacity={0.8}
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
                <CardTitle>Revenu par 1000 vues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(totals.revenue / totals.views * 1000).toFixed(3)} €
                </div>
                <p className="text-sm text-muted-foreground mt-2">RPM estimé</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
