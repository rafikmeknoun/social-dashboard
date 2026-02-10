import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, RefreshCw, Trash2, Facebook, Instagram, Youtube, Music, 
  Users, BarChart3, Check, X
} from 'lucide-react';
import type { Platform } from '@/types';

const platformConfig: Record<Platform, { name: string; icon: React.ElementType; color: string; bgColor: string }> = {
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-500' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bgColor: 'bg-pink-500' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-500' },
  tiktok: { name: 'TikTok', icon: Music, color: 'text-gray-900', bgColor: 'bg-black' },
  adsense: { name: 'AdSense', icon: BarChart3, color: 'text-blue-500', bgColor: 'bg-blue-600' },
  twitter: { name: 'Twitter', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-400' },
  linkedin: { name: 'LinkedIn', icon: Users, color: 'text-blue-700', bgColor: 'bg-blue-700' },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AccountsPage() {
  const { accounts, addAccount, removeAccount } = useData();
  const [syncing, setSyncing] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);
  
  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [accountName, setAccountName] = useState('');
  const [accountUsername, setAccountUsername] = useState('');
  const [followersCount, setFollowersCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSync = (accountId: number) => {
    setSyncing(accountId);
    setTimeout(() => {
      setSyncing(null);
      toast.success('Compte synchronisé avec succès');
    }, 1500);
  };

  const handleAddAccount = async () => {
    if (!accountName.trim()) {
      toast.error('Veuillez entrer un nom de compte');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAccount = {
      platform: selectedPlatform,
      account_id: `${selectedPlatform}_${Date.now()}`,
      account_name: accountName,
      account_username: accountUsername || null,
      profile_picture: null,
      followers_count: parseInt(followersCount) || 0,
      is_active: true,
    };
    
    addAccount(newAccount);
    
    toast.success(`${platformConfig[selectedPlatform].name} connecté avec succès !`);
    
    // Reset form
    setSelectedPlatform('facebook');
    setAccountName('');
    setAccountUsername('');
    setFollowersCount('');
    setIsSubmitting(false);
    setIsAddDialogOpen(false);
  };

  const handleDeleteClick = (accountId: number) => {
    setAccountToDelete(accountId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      removeAccount(accountToDelete);
      toast.success('Compte déconnecté avec succès');
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  // Filter platforms that are not yet connected (for future use)
  void platformConfig;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comptes connectés</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez vos connexions aux réseaux sociaux</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connecter un compte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un compte social</DialogTitle>
              <DialogDescription>
                Connectez un nouveau compte de réseau social à votre dashboard.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Plateforme</Label>
                <Select 
                  value={selectedPlatform} 
                  onValueChange={(v) => setSelectedPlatform(v as Platform)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platformConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color: config.color }} />
                            <span>{config.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nom du compte</Label>
                <Input
                  id="name"
                  placeholder="ex: Ma Page Facebook"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur (optionnel)</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="followers">Nombre d'abonnés</Label>
                <Input
                  id="followers"
                  type="number"
                  placeholder="0"
                  value={followersCount}
                  onChange={(e) => setFollowersCount(e.target.value)}
                />
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Dans une version réelle, vous seriez redirigé vers 
                  {platformConfig[selectedPlatform].name} pour l'authentification OAuth.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleAddAccount} 
                disabled={isSubmitting || !accountName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Connecter
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Social accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun compte connecté</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connectez vos comptes de réseaux sociaux pour commencer à suivre vos KPIs.
                </p>
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Connecter un compte
                </Button>
              </div>
            ) : (
              accounts.map((account) => {
                const config = platformConfig[account.platform];
                const Icon = config?.icon || Users;

                return (
                  <div key={account.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className={`h-12 w-12 rounded-full ${config?.bgColor || 'bg-gray-500'} flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{account.account_name}</p>
                        <p className="text-sm text-gray-500">@{account.account_username || account.account_id}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant={account.is_active ? 'default' : 'secondary'}>
                            {account.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                          <span className="ml-2 text-xs text-gray-500">
                            {formatNumber(account.followers_count)} abonnés
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSync(account.id)}
                      >
                        <RefreshCw className={`h-5 w-5 ${syncing === account.id ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(account.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Web</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Google Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">
              Connectez Google Analytics pour suivre le trafic de vos sites web.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connecter Google Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Déconnecter le compte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir déconnecter ce compte ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <X className="mr-2 h-4 w-4" />
              Déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
