import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Plus, Activity, Users, TrendingDown, Clock, Signal } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const trafficSourceColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

interface KPICardProps {
  title: string;
  value: number | string;
  change: number;
  icon: React.ElementType;
}

function KPICard({ title, value, change, icon: Icon }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingDown className={`h-4 w-4 mr-1 ${isPositive ? 'rotate-180' : ''}`} />
          {Math.abs(change)}%
          <span className="ml-1 text-gray-500">vs période précédente</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { analyticsOverview } = useData();

  const sessionsData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    sessions: Math.floor(Math.random() * 1500) + 500,
  }));

  const trafficSourceData = Object.entries(analyticsOverview.traffic_sources || {}).map(([source, value]) => ({
    name: source,
    value,
  }));

  const deviceData = [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 45 },
    { name: 'Tablet', value: 10 },
  ];

  const bounceRatePercent = (analyticsOverview.avg_bounce_rate * 100).toFixed(1);
  const sessionDurationMin = Math.floor(analyticsOverview.avg_session_duration / 60);
  const sessionDurationSec = Math.floor(analyticsOverview.avg_session_duration % 60);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Web</h1>
          <p className="mt-1 text-sm text-gray-500">Analysez le trafic et les performances de vos sites web</p>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une propriété
        </Button>
      </div>

      {/* Realtime stats */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Utilisateurs actifs</p>
              <p className="text-white text-4xl font-bold mt-1">42</p>
              <p className="text-blue-200 text-sm mt-1">156 pages vues aujourd'hui</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <Signal className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Sessions" value={formatNumber(analyticsOverview.total_sessions)} change={8.5} icon={Activity} />
        <KPICard title="Utilisateurs" value={formatNumber(analyticsOverview.total_users)} change={12.3} icon={Users} />
        <KPICard title="Taux de rebond" value={`${bounceRatePercent}%`} change={-2.1} icon={TrendingDown} />
        <KPICard title="Durée moyenne" value={`${sessionDurationMin}m ${sessionDurationSec}s`} change={5.7} icon={Clock} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sessionsData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficSourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={trafficSourceColors[index % trafficSourceColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {trafficSourceData.map((source, index) => (
                <div key={source.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: trafficSourceColors[index % trafficSourceColors.length] }} 
                  />
                  <span className="text-xs text-gray-600">{source.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device breakdown & Top Pages */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appareils</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages populaires</CardTitle>
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
