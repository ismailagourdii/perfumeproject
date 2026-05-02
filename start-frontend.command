#!/bin/bash
echo "🚀 Starting SCENTARA Frontend..."
echo ""

# Kill any stuck Next.js process
pkill -f "next dev" 2>/dev/null
sleep 1

# Remove stale lock file
rm -f /Users/mac/perfume-ai-project/frontend/.next/dev/lock

# Navigate to frontend
cd /Users/mac/perfume-ai-project/frontend

# Start the dev server
echo "Starting Next.js on http://localhost:3001 ..."
npm run dev
