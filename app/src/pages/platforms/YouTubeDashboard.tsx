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
  Youtube, Users, Eye, Clock, DollarSign, 
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import type { YouTubeKPIs } from '@/types';

// Generate mock YouTube KPIs data
function generateYouTubeKPIs(days: number): (YouTubeKPIs & { date: string })[] {
  const data: (YouTubeKPIs & { date: string })[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const views = Math.floor(Math.random() * 8000) + 4000;
    const watchTime = views * (2 + Math.random() * 3);
    
    data.push({
      date: date.toISOString().split('T')[0],
      followers: 15600 + Math.floor(Math.random() * 300 - 100),
      views,
      reach: views * 0.8,
      impressions: views * 2.5,
      engagement_rate: Math.random() * 6 + 2,
      likes: Math.floor(views * 0.05),
      comments: Math.floor(views * 0.008),
      shares: Math.floor(views * 0.003),
      saves: Math.floor(views * 0.015),
      clicks: Math.floor(views * 0.04),
      watch_time_minutes: watchTime,
      average_view_duration: 120 + Math.random() * 180,
      revenue: Math.random() * 150 + 50,
      posts_count: Math.floor(Math.random() * 2),
      stories_count: 0,
      videos_count: Math.floor(Math.random() * 2),
      new_followers: Math.floor(Math.random() * 30) + 5,
      unfollows: Math.floor(Math.random() * 5) + 1,
      profile_visits: Math.floor(views * 0.08),
      website_clicks: Math.floor(views * 0.02),
      email_contacts: 0,
      get_directions_clicks: 0,
      phone_call_clicks: 0,
      text_message_clicks: 0,
      subscribers_gained: Math.floor(Math.random() * 35) + 5,
      subscribers_lost: Math.floor(Math.random() * 6) + 1,
      estimated_minutes_watched: watchTime,
      average_view_percentage: 40 + Math.random() * 30,
      annotation_click_through_rate: Math.random() * 3 + 0.5,
      card_clicks: Math.floor(views * 0.01),
      card_teaser_clicks: Math.floor(views * 0.015),
      dislikes: Math.floor(views * 0.002),
      red_views: Math.floor(views * 0.05),
      red_watch_time_minutes: watchTime * 0.05,
    });
  }
  
  return data;
}

// const COLORS = ['#FF0000', '#282828', '#CC0000', '#FF4444', '#990000'];

export default function YouTubeDashboard() {
  const { dateRange, getRevenueByPlatform } = useData();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);
  
  const kpisData = useMemo(() => generateYouTubeKPIs(timeRange), [timeRange, refreshing]);
  
  const revenueData = useMemo(() => {
    return getRevenueByPlatform('youtube')
      .filter(r => r.date >= dateRange.startDate && r.date <= dateRange.endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getRevenueByPlatform, dateRange, refreshing]);
  
  const totals = useMemo(() => {
    return kpisData.reduce((acc, day) => ({
      followers: day.followers,
      views: acc.views + day.views,
      watch_time: acc.watch_time + day.watch_time_minutes,
      likes: acc.likes + day.likes,
      comments: acc.comments + day.comments,
      shares: acc.shares + day.shares,
      revenue: acc.revenue + day.revenue,
      subscribers_gained: acc.subscribers_gained + day.subscribers_gained,
      subscribers_lost: acc.subscribers_lost + day.subscribers_lost,
      red_views: acc.red_views + day.red_views,
      videos: acc.videos + day.videos_count,
    }), {
      followers: 0,
      views: 0,
      watch_time: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      revenue: 0,
      subscribers_gained: 0,
      subscribers_lost: 0,
      red_views: 0,
      videos: 0,
    });
  }, [kpisData]);
  
  const viewsData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      vues: day.views,
      red_views: day.red_views,
    }));
  }, [kpisData]);
  
  const watchTimeData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      minutes: Math.floor(day.watch_time_minutes),
      avg_duration: Math.floor(day.average_view_duration),
    }));
  }, [kpisData]);
  
  const subscribersData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      gained: day.subscribers_gained,
      lost: day.subscribers_lost,
      net: day.subscribers_gained - day.subscribers_lost,
    }));
  }, [kpisData]);
  
  const engagementData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      likes: day.likes,
      comments: day.comments,
      shares: day.shares,
      dislikes: day.dislikes,
    }));
  }, [kpisData]);
  
  const revenueChartData = useMemo(() => {
    return revenueData.map(r => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      revenue: r.revenue,
      rpm: r.cpm || 0,
    }));
  }, [revenueData]);
  
  const trafficSources = useMemo(() => [
    { name: 'Recherche YouTube', value: 35, color: '#FF0000' },
    { name: 'Suggestions', value: 28, color: '#282828' },
    { name: 'Page d\'accueil', value: 20, color: '#CC0000' },
    { name: 'Externe', value: 12, color: '#FF4444' },
    { name: 'Autre', value: 5, color: '#990000' },
  ], []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Format watch time
  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center">
            <Youtube className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">YouTube</h1>
            <p className="text-muted-foreground">Tableau de bord détaillé de votre chaîne YouTube</p>
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
              +{totals.subscribers_gained - totals.subscribers_lost} net
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Temps de visionnage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWatchTime(totals.watch_time)}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {formatWatchTime(totals.watch_time / timeRange)}/jour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus estimés</CardTitle>
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
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vues</CardTitle>
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
                    <Area type="monotone" dataKey="vues" stackId="1" stroke="#FF0000" fill="#FF0000" fillOpacity={0.6} name="Vues standard" />
                    <Area type="monotone" dataKey="red_views" stackId="1" stroke="#CC0000" fill="#CC0000" fillOpacity={0.6} name="YouTube Premium" />
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
                <CardTitle className="text-sm">J'aime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.likes.toLocaleString('fr-FR')}</div>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vidéos publiées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.videos}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temps de visionnage</CardTitle>
              <CardDescription>Minutes regardées et durée moyenne</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={watchTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="minutes" stroke="#FF0000" strokeWidth={2} name="Minutes regardées" />
                  <Line yAxisId="right" type="monotone" dataKey="avg_duration" stroke="#282828" strokeWidth={2} name="Durée moyenne (sec)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Retention moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center py-8">
                  {(kpisData.reduce((acc, d) => acc + d.average_view_percentage, 0) / kpisData.length).toFixed(1)}%
                </div>
                <p className="text-center text-muted-foreground">
                  Pourcentage moyen de vidéo regardé
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vues YouTube Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center py-8">
                  {totals.red_views.toLocaleString('fr-FR')}
                </div>
                <p className="text-center text-muted-foreground">
                  {((totals.red_views / totals.views) * 100).toFixed(1)}% du total des vues
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des abonnés</CardTitle>
              <CardDescription>Gains et pertes d'abonnés</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={subscribersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="gained" fill="#22c55e" name="Abonnés gagnés" />
                  <Bar dataKey="lost" fill="#ef4444" name="Abonnés perdus" />
                  <Bar dataKey="net" fill="#3b82f6" name="Net" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total abonnés gagnés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">+{totals.subscribers_gained}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total abonnés perdus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">-{totals.subscribers_lost}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Croissance nette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  +{totals.subscribers_gained - totals.subscribers_lost}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactions</CardTitle>
              <CardDescription>J'aime, commentaires et partages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#22c55e" name="J'aime" />
                  <Bar dataKey="comments" fill="#3b82f6" name="Commentaires" />
                  <Bar dataKey="shares" fill="#f59e0b" name="Partages" />
                  <Bar dataKey="dislikes" fill="#ef4444" name="Je n'aime pas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taux d'engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={kpisData.map(d => ({
                    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    rate: d.engagement_rate,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    <Line type="monotone" dataKey="rate" stroke="#FF0000" strokeWidth={2} name="Taux d'engagement" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cliques sur les cartes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={kpisData.map(d => ({
                    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    card_clicks: d.card_clicks,
                    teaser_clicks: d.card_teaser_clicks,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="card_clicks" fill="#FF0000" name="Cliques cartes" />
                    <Bar dataKey="teaser_clicks" fill="#282828" name="Cliques teasers" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus estimés</CardTitle>
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
                    stroke="#FF0000" 
                    fill="#FF0000" 
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
                <CardTitle>RPM moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(revenueData.reduce((acc, r) => acc + (r.cpm || 0), 0) / (revenueData.length || 1)).toFixed(2)} €
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Revenu par mille impressions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPM moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(kpisData.reduce((acc, d) => acc + d.revenue, 0) / (totals.views / 1000)).toFixed(2)} €
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Coût par mille vues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenu moyen/jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(totals.revenue / timeRange).toFixed(2)} €
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Sur les {timeRange} derniers jours
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
