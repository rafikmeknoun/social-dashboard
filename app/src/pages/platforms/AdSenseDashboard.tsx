import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  BarChart3, DollarSign, Eye, MousePointer, TrendingUp, 
  Monitor, Smartphone, Tablet, 
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import type { AdSenseKPIs } from '@/types';

// Generate mock AdSense KPIs data
function generateAdSenseKPIs(days: number): (AdSenseKPIs & { date: string })[] {
  const data: (AdSenseKPIs & { date: string })[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const pageViews = Math.floor(Math.random() * 3000) + 2000;
    const impressions = Math.floor(pageViews * 2.5);
    const clicks = Math.floor(impressions * 0.025);
    const ctr = (clicks / impressions) * 100;
    const cpc = 0.3 + Math.random() * 0.4;
    const earnings = clicks * cpc;
    
    data.push({
      date: date.toISOString().split('T')[0],
      page_views: pageViews,
      impressions,
      clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      rpm: parseFloat(((earnings / pageViews) * 1000).toFixed(2)),
      estimated_earnings: parseFloat(earnings.toFixed(2)),
      coverage: 85 + Math.random() * 10,
    });
  }
  
  return data;
}

// const COLORS = ['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#9AA0A6'];

export default function AdSenseDashboard() {
  const { dateRange, getRevenueByPlatform } = useData();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);
  
  const kpisData = useMemo(() => generateAdSenseKPIs(timeRange), [timeRange, refreshing]);
  
  // Get AdSense revenue data for reference
  void getRevenueByPlatform;
  void dateRange;
  
  const totals = useMemo(() => {
    return kpisData.reduce((acc, day) => ({
      page_views: acc.page_views + day.page_views,
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      earnings: acc.earnings + day.estimated_earnings,
    }), {
      page_views: 0,
      impressions: 0,
      clicks: 0,
      earnings: 0,
    });
  }, [kpisData]);
  
  const avgMetrics = useMemo(() => {
    return {
      ctr: (kpisData.reduce((acc, d) => acc + d.ctr, 0) / kpisData.length),
      cpc: (kpisData.reduce((acc, d) => acc + d.cpc, 0) / kpisData.length),
      rpm: (kpisData.reduce((acc, d) => acc + d.rpm, 0) / kpisData.length),
      coverage: (kpisData.reduce((acc, d) => acc + d.coverage, 0) / kpisData.length),
    };
  }, [kpisData]);
  
  const earningsData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      earnings: day.estimated_earnings,
      rpm: day.rpm,
    }));
  }, [kpisData]);
  
  const impressionsData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      page_views: day.page_views,
      impressions: day.impressions,
      clicks: day.clicks,
    }));
  }, [kpisData]);
  
  const ctrData = useMemo(() => {
    return kpisData.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      ctr: day.ctr,
      cpc: day.cpc,
    }));
  }, [kpisData]);
  
  const deviceData = useMemo(() => [
    { name: 'Desktop', value: 45, color: '#4285F4' },
    { name: 'Mobile', value: 48, color: '#34A853' },
    { name: 'Tablette', value: 7, color: '#FBBC04' },
  ], []);
  
  const adFormatData = useMemo(() => [
    { name: 'Display', value: 40, color: '#4285F4' },
    { name: 'In-article', value: 25, color: '#34A853' },
    { name: 'Multiplex', value: 20, color: '#FBBC04' },
    { name: 'In-feed', value: 10, color: '#EA4335' },
    { name: 'Autre', value: 5, color: '#9AA0A6' },
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
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Google AdSense</h1>
            <p className="text-muted-foreground">Tableau de bord détaillé de vos revenus AdSense</p>
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
            <CardTitle className="text-sm font-medium">Gains estimés</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.earnings.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {(totals.earnings / timeRange).toFixed(2)} €/jour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.impressions.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{(totals.impressions / timeRange / 1000).toFixed(1)}k/jour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.clicks.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {avgMetrics.ctr.toFixed(2)}% CTR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPM</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMetrics.rpm.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Revenu/1000 pages
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="earnings">Gains</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gains estimés</CardTitle>
                <CardDescription>Évolution des revenus sur la période</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#4285F4" 
                      fill="#4285F4" 
                      fillOpacity={0.6}
                      name="Gains (€)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impressions & Clics</CardTitle>
                <CardDescription>Pages vues, impressions et clics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={impressionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="page_views" fill="#4285F4" name="Pages vues" />
                    <Bar yAxisId="left" dataKey="impressions" fill="#34A853" name="Impressions" />
                    <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#EA4335" strokeWidth={2} name="Clics" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pages vues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.page_views.toLocaleString('fr-FR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CTR moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgMetrics.ctr.toFixed(2)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CPC moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgMetrics.cpc.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Couverture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgMetrics.coverage.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gains & RPM</CardTitle>
              <CardDescription>Revenus et revenu par mille pages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'Gains (€)' ? `${value.toFixed(2)} €` : `${value.toFixed(2)} €`
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="earnings" fill="#4285F4" name="Gains (€)" />
                  <Line yAxisId="right" type="monotone" dataKey="rpm" stroke="#34A853" strokeWidth={2} name="RPM (€)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Gains totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{totals.earnings.toFixed(2)} €</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Sur les {timeRange} derniers jours
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gains moyens/jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(totals.earnings / timeRange).toFixed(2)} €</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Moyenne quotidienne
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gains par clic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgMetrics.cpc.toFixed(2)} €</div>
                <p className="text-sm text-muted-foreground mt-2">
                  CPC moyen
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CTR & CPC</CardTitle>
              <CardDescription>Taux de clic et coût par clic</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={ctrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'CTR (%)' ? `${value.toFixed(2)}%` : `${value.toFixed(2)} €`
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="ctr" fill="#FBBC04" name="CTR (%)" />
                  <Line yAxisId="right" type="monotone" dataKey="cpc" stroke="#EA4335" strokeWidth={2} name="CPC (€)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Formats d'annonces</CardTitle>
                <CardDescription>Répartition par format</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={adFormatData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {adFormatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques clés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-muted-foreground">Impressions totales</span>
                    <span className="font-bold">{totals.impressions.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-muted-foreground">Clics totaux</span>
                    <span className="font-bold">{totals.clicks.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-muted-foreground">CTR moyen</span>
                    <span className="font-bold">{avgMetrics.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-muted-foreground">Couverture moyenne</span>
                    <span className="font-bold">{avgMetrics.coverage.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par appareil</CardTitle>
                <CardDescription>Distribution du trafic par type d'appareil</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance par appareil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium">Desktop</p>
                        <p className="text-sm text-muted-foreground">65% du trafic</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">1.2 € RPM</p>
                      <p className="text-sm text-green-600">+5.2%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">Mobile</p>
                        <p className="text-sm text-muted-foreground">48% du trafic</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">0.8 € RPM</p>
                      <p className="text-sm text-green-600">+3.1%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Tablet className="h-6 w-6 text-yellow-600" />
                      <div>
                        <p className="font-medium">Tablette</p>
                        <p className="text-sm text-muted-foreground">7% du trafic</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">1.0 € RPM</p>
                      <p className="text-sm text-red-600">-1.2%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}