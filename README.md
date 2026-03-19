# 🎰 Roulette Multijoueur

Jeu de roulette européenne en ligne avec mode solo et multijoueur.

## Fonctionnalités

- **Mode Solo** - Jouez seul à votre rythme
- **Mode Multijoueur** - Créez/rejoignez des parties avec des amis
- Roulette européenne (37 numéros: 0-36)
- Paris classiques (numéro, couleur, pair/impair, douzaines, colonnes)
- Physique réaliste de la bille
- Interface responsive (mobile/desktop)

---

## 🚀 Déploiement sur Vercel

### Étape 1: Créer un repository GitHub

1. Allez sur [github.com](https://github.com) et créez un nouveau repository
2. Nommez-le `roulette-multiplayer`
3. Ne cochez pas "Add a README" (on va pousser notre code)

### Étape 2: Pousser le code sur GitHub

```bash
# Extraire le ZIP et aller dans le dossier
cd roulette-multiplayer

# Initialiser git si pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Initial commit - Roulette multiplayer"

# Ajouter votre remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/roulette-multiplayer.git

# Pousser sur GitHub
git push -u origin main
```

### Étape 3: Créer une base de données PostgreSQL

**Option A: Vercel Postgres (Recommandé)**

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur "Add New" → "Storage" → "Postgres"
3. Donnez un nom (ex: `roulette-db`)
4. Sélectionnez la région la plus proche
5. Cliquez sur "Create"

**Option B: Supabase (Gratuit)**

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans "Project Settings" → "Database"
4. Copiez l'URI de connexion (format: `postgresql://...`)

**Option C: Neon (Gratuit)**

1. Allez sur [neon.tech](https://neon.tech)
2. Créez un projet gratuit
3. Copiez la connection string

### Étape 4: Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New" → "Project"
3. Importez votre repository GitHub `roulette-multiplayer`
4. Configurez les variables d'environnement:

```
DATABASE_URL=postgres://...
DIRECT_DATABASE_URL=postgres://...
```

**Note pour Vercel Postgres:**
- Les variables sont automatiquement ajoutées quand vous liez la DB au projet
- `DATABASE_URL` = connection pooling (pour les requêtes)
- `DIRECT_DATABASE_URL` = connexion directe (pour les migrations)

5. Cliquez sur "Deploy"

### Étape 5: Initialiser la base de données

Après le déploiement, lancez les migrations:

1. Allez dans votre projet Vercel
2. Cliquez sur "Settings" → "Environment Variables"
3. Vérifiez que `DATABASE_URL` et `DIRECT_DATABASE_URL` sont présents

4. Localement, créez un fichier `.env` avec vos variables:

```env
DATABASE_URL="votre_database_url"
DIRECT_DATABASE_URL="votre_direct_database_url"
```

5. Poussez les migrations:

```bash
npx prisma migrate deploy
```

Ou utilisez le bouton "Prisma Migrate" dans le dashboard Vercel Postgres.

---

## 🛠️ Développement Local

### Prérequis

- Node.js 18+
- npm ou bun

### Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
# Créez un fichier .env avec:
DATABASE_URL="file:./dev.db"

# Créer la base de données SQLite locale
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

Le jeu sera disponible sur `http://localhost:3000`

---

## 🎮 Comment Jouer

### Mode Solo
1. Cliquez sur "Mode Solo"
2. Choisissez votre solde de départ
3. Placez vos paris et tournez la roue!

### Mode Multijoueur
1. **Créer une partie:**
   - Cliquez sur "Créer une partie"
   - Entrez votre pseudo
   - Partagez le code à 6 caractères avec vos amis

2. **Rejoindre une partie:**
   - Cliquez sur "Rejoindre une partie"
   - Entrez le code reçu
   - Entrez votre pseudo

3. **Pendant le jeu:**
   - Tous les joueurs peuvent parier
   - Seul l'hôte peut tourner la roue
   - Les résultats sont synchronisés automatiquement

---

## 📁 Structure du Projet

```
src/
├── app/
│   ├── api/rooms/          # API routes multijoueur
│   │   ├── route.ts        # Créer/lister les salles
│   │   └── [code]/         # Actions sur une salle
│   │       ├── route.ts    # Détails/supprimer
│   │       ├── join/       # Rejoindre
│   │       ├── leave/      # Quitter
│   │       ├── ready/      # Être prêt
│   │       ├── bet/        # Paris
│   │       ├── spin/       # Tourner la roue
│   │       └── sync/       # Synchronisation
│   └── page.tsx            # Page principale
├── components/
│   ├── GameLobby.tsx       # Menu principal
│   ├── WaitingRoom.tsx     # Salle d'attente
│   ├── RouletteWheel.tsx   # Roue animée
│   ├── BettingTable.tsx    # Tapis de jeu
│   ├── ChipSelector.tsx    # Sélection des jetons
│   └── GameControls.tsx    # Contrôles du jeu
└── lib/
    ├── roulette.ts         # Logique du jeu
    ├── multiplayer.ts      # API multijoueur
    └── db.ts               # Prisma client
```

---

## ⚠️ Notes Importantes

### Pour le multijoueur sur Vercel:

1. **Base de données obligatoire** - SQLite ne fonctionne pas sur Vercel, vous devez utiliser PostgreSQL (Vercel Postgres, Supabase, Neon, etc.)

2. **Synchronisation** - Le jeu utilise du polling (toutes les 1 seconde) pour synchroniser les joueurs. Pour une meilleure expérience, considérez les régions proches.

3. **Variables d'environnement** - Assurez-vous que `DATABASE_URL` et `DIRECT_DATABASE_URL` sont correctement configurées.

### Limitations connues:

- La synchronisation en temps réel n'est pas instantanée (polling de 1s)
- Les parties sont persistées en base de données
- Pas de reconnexion automatique si le navigateur est fermé

---

## 🔧 Technologies Utilisées

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles
- **Framer Motion** - Animations
- **Prisma** - ORM base de données
- **PostgreSQL** - Base de données production
- **SQLite** - Base de données développement

---

## 📄 Licence

MIT - Utilisez librement!
