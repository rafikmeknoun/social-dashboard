import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, Users, Eye, Globe, Heart, ArrowUp, ArrowDown, 
  FileText, DollarSign, Facebook, Youtube, 
  Instagram, Music, BarChart3, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const platformColors: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  adsense: '#4285F4',
};

const trafficSourceColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
}

function generateTimeSeriesData(days: number, min: number, max: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      facebook: Math.floor(Math.random() * (max - min + 1)) + min,
      instagram: Math.floor(Math.random() * (max - min + 1)) + min,
      youtube: Math.floor(Math.random() * (max - min + 1)) + min,
      tiktok: Math.floor(Math.random() * (max - min + 1)) + min,
      sessions: Math.floor(Math.random() * 1500) + 500,
    });
  }
  return data;
}

function generateRevenueData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      facebook: Math.floor(Math.random() * 80) + 20,
      instagram: Math.floor(Math.random() * 60) + 15,
      youtube: Math.floor(Math.random() * 150) + 50,
      tiktok: Math.floor(Math.random() * 40) + 10,
      adsense: Math.floor(Math.random() * 100) + 30,
    });
  }
  return data;
}

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  format?: 'number' | 'percentage' | 'currency';
}

function KPICard({ title, value, change, icon: Icon, format = 'number' }: KPICardProps) {
  let formattedValue: string;
  switch (format) {
    case 'percentage':
      formattedValue = `${value.toFixed(1)}%`;
      break;
    case 'currency':
      formattedValue = formatCurrency(value);
      break;
    default:
      formattedValue = formatNumber(value);
  }
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          </div>
        </div>
        <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
          {Math.abs(change)}%
          <span className="ml-1 text-gray-500">vs période précédente</span>
        </div>
      </CardContent>
    </Card>
  );
}

const platformLinks = [
  { name: 'Facebook', to: '/platform/facebook', icon: Facebook, color: 'bg-blue-600', textColor: 'text-blue-600' },
  { name: 'YouTube', to: '/platform/youtube', icon: Youtube, color: 'bg-red-600', textColor: 'text-red-600' },
  { name: 'Instagram', to: '/platform/instagram', icon: Instagram, color: 'bg-pink-600', textColor: 'text-pink-600' },
  { name: 'TikTok', to: '/platform/tiktok', icon: Music, color: 'bg-black', textColor: 'text-gray-900' },
  { name: 'AdSense', to: '/platform/adsense', icon: BarChart3, color: 'bg-blue-500', textColor: 'text-blue-500' },
];

export default function DashboardPage() {
  const { socialOverview, analyticsOverview, posts, revenueData, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [socialMetric, setSocialMetric] = useState('views');
  void setSocialMetric;

  const socialData = generateTimeSeriesData(30, 1000, 5000);
  const analyticsChartData = generateTimeSeriesData(30, 500, 2000);
  const revenueChartData = generateRevenueData(30);

  const platformData = Object.entries(socialOverview.platforms || {}).map(([platform, stats]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: stats.followers,
    color: platformColors[platform] || '#gray',
  }));

  const trafficSourceData = Object.entries(analyticsOverview.traffic_sources || {}).map(([source, value]) => ({
    name: source,
    value,
  }));

  const engagementRate = socialOverview.total_reach > 0
    ? (socialOverview.total_engagement / socialOverview.total_reach) * 100
    : 0;

  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de vos performances sur tous les canaux</p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Platform Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {platformLinks.map((platform) => {
          const Icon = platform.icon;
          return (
            <Link key={platform.name} to={platform.to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Abonnés totaux" value={socialOverview.total_followers} change={12.5} icon={Users} />
        <KPICard title="Vues totales" value={socialOverview.total_views} change={8.2} icon={Eye} />
        <KPICard title="Revenus" value={totalRevenue} change={15.3} icon={DollarSign} format="currency" />
        <KPICard title="Sessions web" value={analyticsOverview.total_sessions} change={-3.1} icon={Globe} />
        <KPICard title="Taux d'engagement" value={engagementRate} change={5.7} icon={Heart} format="percentage" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Performance réseaux sociaux</CardTitle>
            <select
              value={socialMetric}
              onChange={(e) => setSocialMetric(e.target.value)}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="views">Vues</option>
              <option value="engagement">Engagement</option>
              <option value="followers">Abonnés</option>
            </select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={socialData}>
                <defs>
                  <linearGradient id="colorFb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1877F2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1877F2" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E4405F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E4405F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="facebook" stroke="#1877F2" fillOpacity={1} fill="url(#colorFb)" />
                <Area type="monotone" dataKey="instagram" stroke="#E4405F" fillOpacity={1} fill="url(#colorIg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenus par plateforme</CardTitle>
            <Link to="/revenue" className="text-sm text-blue-600 hover:text-blue-700">Voir tout</Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value} €`} />
                <Area type="monotone" dataKey="youtube" stackId="1" stroke="#FF0000" fill="#FF0000" />
                <Area type="monotone" dataKey="adsense" stackId="1" stroke="#4285F4" fill="#4285F4" />
                <Area type="monotone" dataKey="facebook" stackId="1" stroke="#1877F2" fill="#1877F2" />
                <Area type="monotone" dataKey="instagram" stackId="1" stroke="#E4405F" fill="#E4405F" />
                <Area type="monotone" dataKey="tiktok" stackId="1" stroke="#000000" fill="#000000" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par plateforme</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {platformData.map((platform) => (
                <div key={platform.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: platform.color }} />
                  <span className="text-xs text-gray-600">{platform.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {trafficSourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={trafficSourceColors[index % trafficSourceColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trafic web</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts & Top Pages */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Publications récentes</CardTitle>
            <Link to="/posts" className="text-sm text-blue-600 hover:text-blue-700">Voir tout</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {post.media_url ? (
                      <img src={post.media_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.content?.substring(0, 60)}...
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <Badge variant="secondary" className="capitalize">
                          {post.social_account?.platform}
                        </Badge>
                        <span>{new Date(post.published_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatNumber(post.views_count)}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {formatNumber(post.likes_count)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pages populaires</CardTitle>
            <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-700">Voir tout</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {analyticsOverview.top_pages?.slice(0, 5).map((page, index) => (
                <div key={page.path} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{page.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatNumber(page.views)}</p>
                      <p className="text-xs text-gray-500">vues</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
