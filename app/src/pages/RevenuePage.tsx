import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, 
  Facebook, Youtube, Instagram, Music, BarChart3,
  ArrowUpRight, Download
} from 'lucide-react';
import type { Platform } from '@/types';

const platformConfig: Record<Platform, { name: string; icon: React.ElementType; color: string }> = {
  facebook: { name: 'Facebook', icon: Facebook, color: '#1877F2' },
  instagram: { name: 'Instagram', icon: Instagram, color: '#E4405F' },
  youtube: { name: 'YouTube', icon: Youtube, color: '#FF0000' },
  tiktok: { name: 'TikTok', icon: Music, color: '#000000' },
  adsense: { name: 'AdSense', icon: BarChart3, color: '#4285F4' },
  twitter: { name: 'Twitter', icon: TrendingUp, color: '#1DA1F2' },
  linkedin: { name: 'LinkedIn', icon: TrendingUp, color: '#0A66C2' },
};

export default function RevenuePage() {
  const { revenueData, dateRange } = useData();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  
  const filteredRevenueData = useMemo(() => {
    let data = revenueData.filter(r => 
      r.date >= dateRange.startDate && r.date <= dateRange.endDate
    );
    
    if (selectedPlatform !== 'all') {
      data = data.filter(r => r.platform === selectedPlatform);
    }
    
    return data.sort((a, b) => a.date.localeCompare(b.date));
  }, [revenueData, dateRange, selectedPlatform]);
  
  const platformTotals = useMemo(() => {
    const totals: Record<string, { revenue: number; impressions: number; clicks: number }> = {};
    
    filteredRevenueData.forEach(r => {
      if (!totals[r.platform]) {
        totals[r.platform] = { revenue: 0, impressions: 0, clicks: 0 };
      }
      totals[r.platform].revenue += r.revenue;
      totals[r.platform].impressions += r.impressions || 0;
      totals[r.platform].clicks += r.clicks || 0;
    });
    
    return totals;
  }, [filteredRevenueData]);
  
  const totalRevenue = useMemo(() => {
    return filteredRevenueData.reduce((sum, r) => sum + r.revenue, 0);
  }, [filteredRevenueData]);
  
  const totalImpressions = useMemo(() => {
    return filteredRevenueData.reduce((sum, r) => sum + (r.impressions || 0), 0);
  }, [filteredRevenueData]);
  
  const totalClicks = useMemo(() => {
    return filteredRevenueData.reduce((sum, r) => sum + (r.clicks || 0), 0);
  }, [filteredRevenueData]);
  
  const avgCTR = useMemo(() => {
    return totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  }, [totalClicks, totalImpressions]);
  
  const avgRPM = useMemo(() => {
    const days = Math.max(1, filteredRevenueData.length / 5); // Approximate unique days
    return totalRevenue / days;
  }, [totalRevenue, filteredRevenueData.length]);
  
  const dailyRevenue = useMemo(() => {
    const grouped: Record<string, { date: string; revenue: number; [key: string]: number | string }> = {};
    
    filteredRevenueData.forEach(r => {
      if (!grouped[r.date]) {
        grouped[r.date] = { date: r.date, revenue: 0 };
      }
      grouped[r.date].revenue += r.revenue;
      if (!grouped[r.date][r.platform]) {
        grouped[r.date][r.platform] = 0;
      }
      (grouped[r.date][r.platform] as number) += r.revenue;
    });
    
    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      }));
  }, [filteredRevenueData]);
  
  const platformDistribution = useMemo(() => {
    return Object.entries(platformTotals).map(([platform, data]) => ({
      name: platformConfig[platform as Platform]?.name || platform,
      value: data.revenue,
      color: platformConfig[platform as Platform]?.color || '#999',
    }));
  }, [platformTotals]);
  
  const topEarningDays = useMemo(() => {
    return dailyRevenue
      .slice()
      .sort((a, b) => (b.revenue as number) - (a.revenue as number))
      .slice(0, 5);
  }, [dailyRevenue]);
  
  const handleExportCSV = () => {
    const headers = ['Date', 'Plateforme', 'Revenu', 'Impressions', 'Clics', 'CTR', 'CPM'];
    const rows = filteredRevenueData.map(r => [
      r.date,
      platformConfig[r.platform]?.name || r.platform,
      r.revenue.toFixed(2),
      r.impressions || 0,
      r.clicks || 0,
      r.ctr?.toFixed(2) || 0,
      r.cpm?.toFixed(2) || 0,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenus_${dateRange.startDate}_${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenus</h1>
          <p className="text-muted-foreground">
            Suivez vos revenus sur toutes les plateformes
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedPlatform === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPlatform('all')}
        >
          Toutes les plateformes
        </Button>
        {Object.entries(platformConfig).map(([key, config]) => (
          <Button
            key={key}
            variant={selectedPlatform === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform(key as Platform)}
            className="gap-2"
          >
            <config.icon className="h-4 w-4" style={{ color: config.color }} />
            {config.name}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Période sélectionnée
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Total des impressions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString('fr-FR')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              CTR: {avgCTR.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu moyen/jour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRPM.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Moyenne quotidienne
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(platformTotals).map(([platform, data]) => {
          const config = platformConfig[platform as Platform];
          if (!config) return null;
          const Icon = config.icon;
          
          return (
            <Card key={platform} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" style={{ color: config.color }} />
                  <CardTitle className="text-sm">{config.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.revenue.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((data.revenue / totalRevenue) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="distribution">Répartition</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
              <CardDescription>Revenus quotidiens sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
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
                <CardTitle>Meilleurs jours</CardTitle>
                <CardDescription>Top 5 des jours les plus rentables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topEarningDays.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{day.date}</span>
                      <span className="font-bold text-green-600">{(day.revenue as number).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé par plateforme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(platformTotals)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([platform, data]) => {
                      const config = platformConfig[platform as Platform];
                      if (!config) return null;
                      
                      return (
                        <div key={platform} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" style={{ color: config.color }} />
                            <span>{config.name}</span>
                          </div>
                          <span className="font-bold">{data.revenue.toFixed(2)} €</span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par plateforme</CardTitle>
              <CardDescription>Comparaison des revenus par plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                  <Legend />
                  {Object.keys(platformConfig).map((platform) => (
                    <Bar 
                      key={platform}
                      dataKey={platform} 
                      stackId="a"
                      fill={platformConfig[platform as Platform].color}
                      name={platformConfig[platform as Platform].name}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Croissance des revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparaison hebdomadaire</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyRevenue.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des revenus</CardTitle>
                <CardDescription>Part de chaque plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={platformDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance par plateforme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(platformTotals)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([platform, data]) => {
                      const config = platformConfig[platform as Platform];
                      if (!config) return null;
                      const percentage = (data.revenue / totalRevenue) * 100;
                      
                      return (
                        <div key={platform} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" style={{ color: config.color }} />
                              <span className="font-medium">{config.name}</span>
                            </div>
                            <span className="font-bold">{data.revenue.toFixed(2)} €</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: config.color 
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% du total • {data.impressions.toLocaleString('fr-FR')} impressions
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Détails des revenus</CardTitle>
              <CardDescription>Liste détaillée de tous les revenus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plateforme</TableHead>
                      <TableHead>Revenu</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clics</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead>CPM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRevenueData.slice(0, 50).map((revenue, idx) => {
                      const config = platformConfig[revenue.platform];
                      const Icon = config?.icon || TrendingUp;
                      
                      return (
                        <TableRow key={`${revenue.date}-${revenue.platform}-${idx}`}>
                          <TableCell>{new Date(revenue.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color: config?.color }} />
                              <span>{config?.name || revenue.platform}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{revenue.revenue.toFixed(2)} €</TableCell>
                          <TableCell>{(revenue.impressions || 0).toLocaleString('fr-FR')}</TableCell>
                          <TableCell>{(revenue.clicks || 0).toLocaleString('fr-FR')}</TableCell>
                          <TableCell>{(revenue.ctr || 0).toFixed(2)}%</TableCell>
                          <TableCell>{(revenue.cpm || 0).toFixed(2)} €</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredRevenueData.length > 50 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Affichage des 50 premiers résultats sur {filteredRevenueData.length}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
