#!/bin/bash
# Deployment script for Roulette Multiplayer

echo "🎰 Roulette Multiplayer - Deployment Script"
echo "============================================"
echo ""

# Step 1: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Step 2: Login to Vercel
echo "Step 1: Please login to Vercel (if not already logged in)"
vercel login

# Step 3: Link project
echo "Step 2: Linking project to Vercel..."
vercel link --yes

# Step 4: Add environment variable
echo "Step 3: You need to add DATABASE_URL environment variable"
echo "Run: vercel env add DATABASE_URL"
echo "Then paste your Neon PostgreSQL connection string"
echo ""
echo "Get a free Neon database at: https://neon.tech"
echo ""

# Step 5: Deploy
echo "Step 4: Deploying to Vercel..."
vercel --prod

echo ""
echo "Deployment complete! 🎉"
