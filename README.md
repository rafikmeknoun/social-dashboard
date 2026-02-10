# Social Dashboard

Un tableau de bord complet pour analyser les performances de vos réseaux sociaux et sites web.

## 🚀 Fonctionnalités

### Réseaux Sociaux
- **Facebook** : Abonnés, vues, portée, engagement, publications
- **Instagram** : Abonnés, stories, reels, posts, insights
- **YouTube** : Abonnés, vues, minutes regardées, revenus
- **TikTok** : Abonnés, vues, likes, partages

### Analytics Web
- **Google Analytics 4** : Sessions, utilisateurs, pages vues, taux de rebond
- Sources de trafic, appareils, pages populaires
- Données en temps réel

### Tableau de Bord
- Vue d'ensemble de tous les KPIs
- Graphiques interactifs (ApexCharts)
- Filtres par période et plateforme
- Rapports programmables

## 🛠️ Stack Technique

### Backend
- **Laravel 11** - Framework PHP
- **MySQL** - Base de données
- **Redis** - Cache et sessions
- **Sanctum** - Authentification API

### Frontend
- **Vue.js 3** - Framework JavaScript
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **ApexCharts** - Graphiques interactifs
- **Pinia** - Gestion d'état

### Infrastructure
- **Docker** - Conteneurisation
- **Nginx** - Serveur web
- **PHP-FPM** - Processeur PHP

## 📦 Installation

### Prérequis
- Docker & Docker Compose
- Git

### Étapes

1. **Cloner le repository**
```bash
git clone <repository-url>
cd social-dashboard
```

2. **Configurer l'environnement**
```bash
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos configurations
```

3. **Lancer les conteneurs**
```bash
docker-compose up -d
```

4. **Installer les dépendances backend**
```bash
docker-compose exec php composer install
docker-compose exec php php artisan key:generate
docker-compose exec php php artisan migrate
```

5. **Installer les dépendances frontend**
```bash
docker-compose exec node npm install
docker-compose exec node npm run build
```

6. **Accéder à l'application**
- Application : http://localhost
- API : http://localhost/api

## ⚙️ Configuration des APIs

### Facebook / Instagram
1. Créer une app sur [Facebook Developers](https://developers.facebook.com/)
2. Ajouter les produits "Facebook Login" et "Instagram Graph API"
3. Configurer les variables dans `.env` :
```
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

### YouTube
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API YouTube Data v3
3. Créer une clé API
4. Configurer dans `.env` :
```
YOUTUBE_API_KEY=your_api_key
```

### TikTok
1. Créer une app sur [TikTok for Developers](https://developers.tiktok.com/)
2. Configurer dans `.env` :
```
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```

### Google Analytics
1. Créer un compte de service sur Google Cloud
2. Télécharger le fichier JSON des credentials
3. Configurer dans `.env` :
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## 📊 KPIs Disponibles

### Social Media
| Métrique | Description |
|----------|-------------|
| Followers | Nombre d'abonnés |
| Views | Nombre de vues |
| Reach | Portée des publications |
| Impressions | Impressions totales |
| Engagement | Interactions (likes, comments, shares) |
| Likes | J'aime reçus |
| Comments | Commentaires reçus |
| Shares | Partages |
| Saves | Sauvegardes |
| Profile Views | Vues du profil |
| Website Clicks | Clics sur le lien web |
| Minutes Watched | Minutes de visionnage (YouTube) |
| Subscribers | Abonnés (YouTube) |
| Revenue | Revenus (YouTube) |

### Web Analytics
| Métrique | Description |
|----------|-------------|
| Sessions | Sessions utilisateur |
| Users | Utilisateurs uniques |
| Pageviews | Pages vues |
| Bounce Rate | Taux de rebond |
| Session Duration | Durée moyenne des sessions |
| New Users | Nouveaux utilisateurs |
| Returning Users | Utilisateurs récurrents |
| Conversions | Conversions |
| Revenue | Revenus |
| Traffic Sources | Sources de trafic |
| Top Pages | Pages les plus visitées |
| Devices | Répartition par appareil |

## 🔧 Commandes Utiles

```bash
# Démarrer les conteneurs
docker-compose up -d

# Arrêter les conteneurs
docker-compose down

# Voir les logs
docker-compose logs -f

# Exécuter des commandes Artisan
docker-compose exec php php artisan <command>

# Exécuter des migrations
docker-compose exec php php artisan migrate

# Rafraîchir les données
docker-compose exec php php artisan social:sync

# Générer un rapport
docker-compose exec php php artisan report:generate
```

## 📝 License

Ce projet est sous licence MIT.
# social-dashboard
