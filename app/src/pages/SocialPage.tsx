import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Eye, Heart, ArrowUp, Facebook, Instagram, Youtube, Music } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const platformConfig: Record<string, { name: string; icon: React.ElementType; color: string; bgColor: string }> = {
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-500' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bgColor: 'bg-pink-500' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-500' },
  tiktok: { name: 'TikTok', icon: Music, color: 'text-gray-900', bgColor: 'bg-black' },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
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
    });
  }
  return data;
}

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
}

function KPICard({ title, value, change, icon: Icon }: KPICardProps) {
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
            <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
          </div>
        </div>
        <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowUp className="h-4 w-4 mr-1 rotate-180" />}
          {Math.abs(change)}%
          <span className="ml-1 text-gray-500">vs période précédente</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SocialPage() {
  const { accounts, posts, socialOverview } = useData();

  const timeChartData = generateTimeSeriesData(30, 1000, 5000);

  const comparisonData = Object.entries(socialOverview.platforms || {}).map(([platform, stats]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    views: stats.views,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réseaux sociaux</h1>
          <p className="mt-1 text-sm text-gray-500">Analysez vos performances sur toutes les plateformes</p>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Connecter un compte
        </Button>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => {
          const config = platformConfig[account.platform];
          const Icon = config.icon;
          const stats = socialOverview.platforms?.[account.platform];

          return (
            <Card key={account.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    12.5%
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">{config.name}</h3>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{formatNumber(account.followers_count)}</p>
                  <p className="text-sm text-gray-500">abonnés</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{formatNumber(stats?.views || 0)}</p>
                    <p className="text-xs text-gray-500">vues</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{(stats?.engagement_rate || 0).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Abonnés" value={socialOverview.total_followers} change={12.5} icon={Users} />
        <KPICard title="Vues" value={socialOverview.total_views} change={8.2} icon={Eye} />
        <KPICard title="Portée" value={socialOverview.total_reach} change={15.3} icon={Eye} />
        <KPICard title="Engagement" value={socialOverview.total_engagement} change={-2.1} icon={Heart} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des métriques</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} />
                <Line type="monotone" dataKey="instagram" stroke="#E4405F" strokeWidth={2} />
                <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} />
                <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparaison par plateforme</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent posts table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Publications récentes</CardTitle>
          <Button variant="link" asChild>
            <a href="/posts">Voir tout</a>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plateforme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vues</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">J'aime</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Engagement</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.slice(0, 10).map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.media_url ? (
                          <img src={post.media_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <p className="ml-4 text-sm font-medium text-gray-900 truncate max-w-xs">
                          {post.content?.substring(0, 50)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="capitalize">
                        {post.social_account?.platform}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatNumber(post.views_count)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatNumber(post.likes_count)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{post.engagement_rate.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
