import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Facebook, Users, Eye, Heart, DollarSign, 
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import type { FacebookKPIs } from '@/types';

// Generate mock Facebook KPIs data
function generateFacebookKPIs(days: number): (FacebookKPIs & { date: string })[] {
  const data: (FacebookKPIs & { date: string })[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const followers = 45230 + Math.floor(Math.random() * 500 - 200);
    const views = Math.floor(Math.random() * 5000) + 3000;
    const engagement = Math.random() * 8 + 2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      followers,
      views,
      reach: views * 0.7,
      impressions: views * 1.5,
      engagement_rate: engagement,
      likes: Math.floor(views * 0.08),
      comments: Math.floor(views * 0.02),
      shares: Math.floor(views * 0.015),
      saves: Math.floor(views * 0.01),
      clicks: Math.floor(views * 0.05),
      watch_time_minutes: Math.floor(views * 0.3),
      average_view_duration: 45 + Math.random() * 30,
      revenue: Math.random() * 80 + 20,
      posts_count: Math.floor(Math.random() * 3) + 1,
      stories_count: Math.floor(Math.random() * 5),
      videos_count: Math.floor(Math.random() * 2),
      new_followers: Math.floor(Math.random() * 50) + 10,
      unfollows: Math.floor(Math.random() * 10) + 2,
      profile_visits: Math.floor(views * 0.1),
      website_clicks: Math.floor(views * 0.03),
      email_contacts: Math.floor(Math.random() * 5),
      get_directions_clicks: Math.floor(Math.random() * 3),
      phone_call_clicks: Math.floor(Math.random() * 4),
      text_message_clicks: Math.floor(Math.random() * 2),
      page_engaged_users: Math.floor(views * 0.15),
      page_consumptions: Math.floor(views * 0.12),
      page_consumptions_unique: Math.floor(views * 0.1),
      page_negative_feedback: Math.floor(Math.random() * 10),
      page_negative_feedback_unique: Math.floor(Math.random() * 8),
      page_fan_adds: Math.floor(Math.random() * 40) + 10,
      page_fan_removes: Math.floor(Math.random() * 8) + 2,
      page_impressions_organic: Math.floor(views * 0.6),
      page_impressions_paid: Math.floor(views * 0.3),
      page_impressions_viral: Math.floor(views * 0.1),
      post_engagements: Math.floor(views * 0.12),
      reactions: Math.floor(views * 0.06),
    });
  }
  
  return data;
}

// const COLORS = ['#1877F2', '#42B72A', '#FF6B6B', '#FFD93D', '#6BCB77'];

export default function FacebookDashboard() {
  const { dateRange, getRevenueByPlatform } = useData();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);
  
  const kpisData = useMemo(() => generateFacebookKPIs(timeRange), [timeRange, refreshing]);
  
  const revenueData = useMemo(() => {
    return getRevenueByPlatform('facebook')
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
      revenue: acc.revenue + day.revenue,
      new_followers: acc.new_followers + day.new_followers,
      unfollows: acc.unfollows + day.unfollows,
      profile_visits: acc.profile_visits + day.profile_visits,
      website_clicks: acc.website_clicks + day.website_clicks,
      post_engagements: acc.post_engagements + day.post_engagements,
    }), {
      followers: 0,
      views: 0,
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      revenue: 0,
      new_followers: 0,
      unfollows: 0,
      profile_visits: 0,
      website_clicks: 0,
      post_engagements: 0,
    });
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
  
  const impressionsData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      organic: day.page_impressions_organic,
      paid: day.page_impressions_paid,
      viral: day.page_impressions_viral,
    }));
  }, [kpisData]);
  
  const followersGrowth = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      adds: day.page_fan_adds,
      removes: day.page_fan_removes,
      net: day.page_fan_adds - day.page_fan_removes,
    }));
  }, [kpisData]);
  
  const revenueChartData = useMemo(() => {
    return revenueData.map(r => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      revenue: r.revenue,
      impressions: r.impressions || 0,
      clicks: r.clicks || 0,
    }));
  }, [revenueData]);
  
  const trafficSourcesData = useMemo(() => [
    { name: 'Organique', value: 60, color: '#1877F2' },
    { name: 'Payant', value: 25, color: '#42B72A' },
    { name: 'Viral', value: 15, color: '#FF6B6B' },
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
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <Facebook className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facebook</h1>
            <p className="text-muted-foreground">Tableau de bord détaillé de votre page Facebook</p>
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
            <CardTitle className="text-sm font-medium">Engagements</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.post_engagements.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {((totals.post_engagements / totals.views) * 100).toFixed(1)}% taux
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
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vues & Portée</CardTitle>
                <CardDescription>Évolution des vues et de la portée</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={kpisData.map(d => ({
                    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    vues: d.views,
                    portee: d.reach,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="vues" stackId="1" stroke="#1877F2" fill="#1877F2" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="portee" stackId="1" stroke="#42B72A" fill="#42B72A" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sources de trafic</CardTitle>
                <CardDescription>Répartition des impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSourcesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficSourcesData.map((entry, index) => (
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

          <Card>
            <CardHeader>
              <CardTitle>Performance globale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-bold">{totals.impressions.toLocaleString('fr-FR')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">J'aime</p>
                  <p className="text-2xl font-bold">{totals.likes.toLocaleString('fr-FR')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Commentaires</p>
                  <p className="text-2xl font-bold">{totals.comments.toLocaleString('fr-FR')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Partages</p>
                  <p className="text-2xl font-bold">{totals.shares.toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taux d'engagement</CardTitle>
              <CardDescription>Évolution du taux d'engagement sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="engagement" stroke="#1877F2" strokeWidth={2} name="Taux d'engagement (%)" />
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
                    <Bar dataKey="likes" fill="#1877F2" name="J'aime" />
                    <Bar dataKey="comments" fill="#42B72A" name="Commentaires" />
                    <Bar dataKey="shares" fill="#FF6B6B" name="Partages" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impressions par type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={impressionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="organic" stackId="1" stroke="#1877F2" fill="#1877F2" name="Organique" />
                    <Area type="monotone" dataKey="paid" stackId="1" stroke="#42B72A" fill="#42B72A" name="Payant" />
                    <Area type="monotone" dataKey="viral" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" name="Viral" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Croissance des abonnés</CardTitle>
              <CardDescription>Évolution du nombre d'abonnés</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={followersGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="adds" fill="#42B72A" name="Nouveaux" />
                  <Bar dataKey="removes" fill="#FF6B6B" name="Désabonnements" />
                  <Bar dataKey="net" fill="#1877F2" name="Net" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Visites de profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totals.profile_visits.toLocaleString('fr-FR')}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {(totals.profile_visits / timeRange).toFixed(0)} visites/jour en moyenne
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clics site web</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totals.website_clicks.toLocaleString('fr-FR')}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((totals.website_clicks / totals.profile_visits) * 100).toFixed(1)}% de conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux de désabonnement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {((totals.unfollows / totals.new_followers) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {totals.unfollows} désabonnements sur {totals.new_followers} nouveaux
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
                    stroke="#1877F2" 
                    fill="#1877F2" 
                    fillOpacity={0.6}
                    name="Revenus (€)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Impressions publicitaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="impressions" stroke="#42B72A" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clics publicitaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clicks" stroke="#FF6B6B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publications récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Revenu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpisData.slice(-10).reverse().map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(day.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {day.posts_count > 0 ? `${day.posts_count} publication${day.posts_count > 1 ? 's' : ''}` : 'Aucune'}
                        </Badge>
                      </TableCell>
                      <TableCell>{day.views.toLocaleString('fr-FR')}</TableCell>
                      <TableCell>{day.engagement_rate.toFixed(2)}%</TableCell>
                      <TableCell>{day.revenue.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
