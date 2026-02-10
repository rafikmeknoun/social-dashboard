#!/bin/bash

# Social Dashboard - Script de démarrage rapide

echo "🚀 Démarrage de Social Dashboard..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f backend/.env ]; then
    echo "📝 Création du fichier .env..."
    cp backend/.env.example backend/.env
fi

# Démarrer les conteneurs
echo "🐳 Démarrage des conteneurs Docker..."
docker compose up -d

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Installer les dépendances backend
echo "📦 Installation des dépendances backend..."
docker compose exec -T php composer install --no-interaction

# Générer la clé d'application
if [ -z "$(grep '^APP_KEY=' backend/.env | cut -d '=' -f2)" ]; then
    echo "🔑 Génération de la clé d'application..."
    docker compose exec -T php php artisan key:generate
fi

# Exécuter les migrations
echo "🗄️ Exécution des migrations..."
docker compose exec -T php php artisan migrate --force

# Installer les dépendances frontend
echo "📦 Installation des dépendances frontend..."
docker compose exec -T node npm install

# Build du frontend
echo "🔨 Build du frontend..."
docker compose exec -T node npm run build

echo ""
echo "✅ Social Dashboard est démarré !"
echo ""
echo "🌐 Accès à l'application : http://localhost"
echo "📊 API : http://localhost/api"
echo ""
echo "📋 Commandes utiles :"
echo "  - Voir les logs : docker compose logs -f"
echo "  - Arrêter : docker compose down"
echo "  - Redémarrer : docker compose restart"
echo ""