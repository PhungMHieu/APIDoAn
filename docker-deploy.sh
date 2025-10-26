#!/bin/bash

# Docker deployment script for My Finance with Auth Service

echo "🚀 My Finance - Docker Deployment"
echo "=================================="
echo ""

# Detect docker compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "Using: $DOCKER_COMPOSE"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to clean up old containers and volumes
cleanup() {
    echo ""
    echo "🧹 Cleaning up old containers and volumes..."
    $DOCKER_COMPOSE down -v
    echo "✅ Cleanup complete"
}

# Function to build images
build_images() {
    echo ""
    echo "🔨 Building Docker images..."
    $DOCKER_COMPOSE build --no-cache
    if [ $? -eq 0 ]; then
        echo "✅ Build complete"
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Function to start services
start_services() {
    echo ""
    echo "🚢 Starting services..."
    $DOCKER_COMPOSE up -d
    if [ $? -eq 0 ]; then
        echo "✅ Services started"
    else
        echo "❌ Failed to start services"
        exit 1
    fi
}

# Function to show service status
show_status() {
    echo ""
    echo "📊 Service Status:"
    echo "=================="
    $DOCKER_COMPOSE ps
}

# Function to show service URLs
show_urls() {
    echo ""
    echo "🌐 Service URLs:"
    echo "================"
    echo "API Gateway:        http://localhost:3000"
    echo "Transaction Service: http://localhost:3001"
    echo "Account Service:    http://localhost:3002"
    echo "Auth Service:       http://localhost:3003"
    echo "  └─ Swagger:       http://localhost:3003/api"
    echo ""
    echo "🔧 Management Tools:"
    echo "==================="
    echo "pgAdmin (PostgreSQL): http://localhost:5050"
    echo "  └─ Email: admin@myfinance.com"
    echo "  └─ Password: admin123"
    echo "phpMyAdmin (MySQL):   http://localhost:8080"
    echo "Mongo Express:        http://localhost:8081"
    echo "  └─ Username: admin"
    echo "  └─ Password: admin123"
}

# Function to show logs
show_logs() {
    echo ""
    echo "📋 Showing logs (Ctrl+C to stop)..."
    $DOCKER_COMPOSE logs -f
}

# Main script
main() {
    check_docker
    
    case "${1:-}" in
        "clean")
            cleanup
            ;;
        "build")
            build_images
            ;;
        "start")
            start_services
            show_status
            show_urls
            ;;
        "stop")
            echo "🛑 Stopping services..."
            $DOCKER_COMPOSE down
            echo "✅ Services stopped"
            ;;
        "restart")
            echo "🔄 Restarting services..."
            $DOCKER_COMPOSE restart
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            show_urls
            ;;
        "deploy")
            cleanup
            build_images
            start_services
            show_status
            show_urls
            echo ""
            echo "🎉 Deployment complete!"
            echo ""
            echo "💡 Tips:"
            echo "  - View logs: ./docker-deploy.sh logs"
            echo "  - Check status: ./docker-deploy.sh status"
            echo "  - Stop services: ./docker-deploy.sh stop"
            ;;
        *)
            echo "Usage: ./docker-deploy.sh {deploy|start|stop|restart|build|clean|logs|status}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Clean, build and deploy all services"
            echo "  start    - Start all services"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  build    - Build Docker images"
            echo "  clean    - Remove containers and volumes"
            echo "  logs     - Show service logs"
            echo "  status   - Show service status and URLs"
            exit 1
            ;;
    esac
}

main "$@"
