#!/bin/bash

# Auth Integration Deployment Script
# Rebuild and restart all services with authentication

set -e

echo "🔄 Auth Integration Deployment Starting..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop all services
echo -e "${BLUE}📦 Stopping all services...${NC}"
docker compose stop

# Rebuild services with authentication
echo ""
echo -e "${BLUE}🔨 Building auth-service...${NC}"
docker compose build --no-cache auth-service

echo ""
echo -e "${BLUE}🔨 Building transaction-service...${NC}"
docker compose build --no-cache transaction-service

echo ""
echo -e "${BLUE}🔨 Building account-service...${NC}"
docker compose build --no-cache account-service

echo ""
echo -e "${BLUE}🔨 Building api-gateway...${NC}"
docker compose build --no-cache api-gateway

# Start all services
echo ""
echo -e "${BLUE}🚀 Starting all services...${NC}"
docker compose up -d

# Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start (15 seconds)...${NC}"
sleep 15

# Check service health
echo ""
echo -e "${BLUE}🏥 Checking service health...${NC}"
echo ""

services=("auth-service:3003" "transaction-service:3002" "account-service:3002" "api-gateway:3000")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if docker compose ps | grep -q "$name.*running"; then
        echo -e "${GREEN}✅ $name is running on port $port${NC}"
    else
        echo -e "${YELLOW}⚠️  $name may not be running properly${NC}"
    fi
done

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "📚 Service URLs:"
echo "  • Auth Service:        http://localhost:3003"
echo "  • Auth Swagger:        http://localhost:3003/api"
echo "  • Transaction Service: http://localhost:3001/transactions"
echo "  • Transaction Swagger: http://localhost:3001/api"
echo "  • Account Service:     http://localhost:3002"
echo "  • Account Swagger:     http://localhost:3002/api"
echo "  • API Gateway:         http://localhost:3000"
echo "  • Gateway Swagger:     http://localhost:3000/api"
echo ""
echo "🧪 Test Authentication:"
echo "  1. Register: curl -X POST http://localhost:3003/auth/register \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"Test123456\"}'"
echo ""
echo "  2. Login:    curl -X POST http://localhost:3003/auth/login \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"username\":\"test\",\"password\":\"Test123456\"}'"
echo ""
echo "  3. Use token to access protected endpoints"
echo ""
echo "📊 View logs: docker compose logs -f [service-name]"
echo "🛑 Stop all:  docker compose stop"
echo ""
