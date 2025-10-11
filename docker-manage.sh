#!/bin/bash

# My Finance Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Function to build the application
build_app() {
    print_status "Building NestJS application..."
    npm run build
    print_success "Application built successfully!"
}

# Function to start full production environment
start_production() {
    print_status "Starting full production environment..."
    build_app
    docker compose up --build -d
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  - API Gateway: http://localhost:3000"
    echo "  - Transaction Service: http://localhost:3001"
    echo "  - Account Service: http://localhost:3002"
    echo "  - pgAdmin: http://localhost:5050"
    echo "  - Mongo Express: http://localhost:8081"
    echo "  - phpMyAdmin: http://localhost:8080"
}

# Function to start local development environment
start_local() {
    print_status "Starting local development environment (databases only)..."
    docker compose -f docker-compose.local.yml up -d
    print_success "Local databases started!"
    print_status "Database UI tools available at:"
    echo "  - pgAdmin: http://localhost:5051"
    echo "  - Mongo Express: http://localhost:8082"
    echo "  - phpMyAdmin: http://localhost:8083"
    print_warning "Remember to start your services locally:"
    echo "  npm run start:gateway"
    echo "  npm run start:transaction"
    echo "  npm run start:account"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all Docker services..."
    docker compose down 2>/dev/null || true
    docker compose -f docker-compose.local.yml down 2>/dev/null || true
    print_success "All services stopped!"
}

# Function to reset all data
reset_data() {
    print_warning "This will delete all database data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting all data..."
        docker compose down -v 2>/dev/null || true
        docker compose -f docker-compose.local.yml down -v 2>/dev/null || true
        print_success "All data reset!"
    else
        print_status "Reset cancelled."
    fi
}

# Function to show logs
show_logs() {
    if [ "$1" = "local" ]; then
        docker compose -f docker-compose.local.yml logs -f
    else
        docker compose logs -f
    fi
}

# Function to check service status
check_status() {
    print_status "Checking service status..."
    echo
    print_status "Production containers:"
    docker compose ps 2>/dev/null || echo "No production containers running"
    echo
    print_status "Local development containers:"
    docker compose -f docker-compose.local.yml ps 2>/dev/null || echo "No local containers running"
    echo
    print_status "All running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show help
show_help() {
    echo "My Finance Docker Management Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  prod, production    Start full production environment"
    echo "  local, dev          Start local development environment (databases only)"
    echo "  stop                Stop all Docker services"
    echo "  reset               Reset all data (destructive)"
    echo "  logs [local]        Show logs (add 'local' for local environment)"
    echo "  status              Check service status"
    echo "  build               Build application only"
    echo "  help                Show this help message"
    echo
    echo "Examples:"
    echo "  $0 prod             # Start production environment"
    echo "  $0 local            # Start databases for local development"
    echo "  $0 logs             # Show production logs"
    echo "  $0 logs local       # Show local development logs"
    echo "  $0 reset            # Reset all data"
}

# Main script logic
main() {
    # Change to script directory
    cd "$(dirname "$0")"
    
    check_docker

    case "${1:-help}" in
        "prod"|"production")
            start_production
            ;;
        "local"|"dev")
            start_local
            ;;
        "stop")
            stop_services
            ;;
        "reset")
            reset_data
            ;;
        "logs")
            show_logs "$2"
            ;;
        "status")
            check_status
            ;;
        "build")
            build_app
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"