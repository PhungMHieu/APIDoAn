#!/bin/bash

echo "🏗️ Building all NestJS applications..."

# Build all applications
npm run build
npx nest build transaction-svc
npx nest build account-svc 
npx nest build api-gateway

echo "✅ Build completed!"

# Check build results
echo "📁 Build artifacts:"
ls -la dist/apps/

echo "🔍 Available main files:"
find dist/apps/ -name "main.js" -exec echo "  ✓ {}" \;

echo ""
echo "🚀 Ready to run:"
echo "  - Local: npm run start:transaction, npm run start:account, npm run start:gateway"
echo "  - Docker: docker compose up --build"