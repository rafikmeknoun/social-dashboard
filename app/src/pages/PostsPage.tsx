import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Heart, FileText } from 'lucide-react';

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-100 text-blue-800',
  instagram: 'bg-pink-100 text-pink-800',
  youtube: 'bg-red-100 text-red-800',
  tiktok: 'bg-gray-100 text-gray-800',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PostsPage() {
  const { posts, accounts } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = !filterPlatform || 
      post.social_account?.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
          <p className="mt-1 text-sm text-gray-500">Toutes vos publications sur les réseaux sociaux</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="h-10 px-3 border rounded-md text-sm"
              >
                <option value="">Toutes les plateformes</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.platform}>
                    {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative">
              {post.media_url ? (
                <img src={post.media_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge className={platformColors[post.social_account?.platform || ''] || 'bg-gray-100'}>
                  {post.social_account?.platform}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded capitalize">
                  {post.post_type}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-gray-900 line-clamp-2 mb-3">
                {post.content || 'Sans contenu'}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(post.published_at)}</span>
                <div className="flex items-center space-x-4">
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
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Engagement: {post.engagement_rate.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune publication</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucune publication ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
}
