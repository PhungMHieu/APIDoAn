#!/bin/bash

# Auth Service Quick Start Script

echo "🚀 Starting Auth Service..."
echo ""

# Check if PostgreSQL is running on port 5433
if ! nc -z localhost 5433 2>/dev/null; then
    echo "⚠️  PostgreSQL not found on port 5433"
    echo "Starting PostgreSQL container for Auth Service..."
    docker run -d \
        --name postgres-auth \
        -e POSTGRES_DB=auth_db \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -p 5433:5432 \
        postgres:15-alpine
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
else
    echo "✅ PostgreSQL already running on port 5433"
fi

echo ""
echo "🔧 Starting Auth Service in development mode..."
echo ""

# Start auth service
npm run start:native:auth
