#!/bin/bash

# 🚀 My Finance Local Development Script
# Usage: ./local-dev.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}=====================================\\n$1\\n=====================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check if databases are running
check_databases() {
    print_info "Checking local databases..."
    
    # Check PostgreSQL
    if docker ps | grep -q "my_finance_postgres_local"; then
        print_success "PostgreSQL is running on port 5433"
    else
        print_warning "PostgreSQL not running. Starting databases..."
        start_databases
        return
    fi
    
    # Check MongoDB
    if docker ps | grep -q "my_finance_mongodb_local"; then
        print_success "MongoDB is running on port 27018"
    else
        print_warning "MongoDB not running. Starting databases..."
        start_databases
        return
    fi
    
    # Check MySQL
    if docker ps | grep -q "my_finance_mysql_local"; then
        print_success "MySQL is running on port 3307"
    else
        print_warning "MySQL not running. Starting databases..."
        start_databases
        return
    fi
}

# Start databases
start_databases() {
    print_header "🗄️  Starting Local Databases"
    docker compose -f docker-compose.local.yml up -d
    
    print_info "Waiting for databases to be ready..."
    sleep 15
    
    print_success "Databases started successfully!"
    print_info "PostgreSQL: localhost:5433"
    print_info "MongoDB: localhost:27018"  
    print_info "MySQL: localhost:3307"
    echo ""
    print_info "Database UIs:"
    print_info "pgAdmin: http://localhost:5051"
    print_info "Mongo Express: http://localhost:8082"
    print_info "phpMyAdmin: http://localhost:8083"
}

# Stop databases
stop_databases() {
    print_header "🛑 Stopping Local Databases"
    docker compose -f docker-compose.local.yml down
    print_success "Databases stopped!"
}

# Start all services
start_all() {
    check_docker
    check_databases
    
    print_header "🚀 Starting My Finance Local Development"
    
    # Build application
    print_info "Building application..."
    npm run build
    
    print_success "Ready to start services!"
    echo ""
    print_info "Open 3 separate terminals and run:"
    echo -e "${YELLOW}Terminal 1:${NC} npm run start:local:gateway"
    echo -e "${YELLOW}Terminal 2:${NC} npm run start:local:transaction"  
    echo -e "${YELLOW}Terminal 3:${NC} npm run start:local:account"
    echo ""
    print_info "Or use the start-services command to run all in background"
}

# Start services in background
start_services() {
    check_docker
    check_databases
    
    print_header "🚀 Starting All Services in Background"
    
    # Build first
    npm run build
    
    # Start services in background
    print_info "Starting API Gateway..."
    NODE_ENV=development npm run start:gateway > logs/gateway.log 2>&1 &
    GATEWAY_PID=$!
    
    print_info "Starting Transaction Service..."
    NODE_ENV=development npm run start:transaction > logs/transaction.log 2>&1 &
    TRANSACTION_PID=$!
    
    print_info "Starting Account Service..."
    NODE_ENV=development npm run start:account > logs/account.log 2>&1 &
    ACCOUNT_PID=$!
    
    # Create PID file for stopping later
    mkdir -p .tmp
    echo "$GATEWAY_PID" > .tmp/gateway.pid
    echo "$TRANSACTION_PID" > .tmp/transaction.pid  
    echo "$ACCOUNT_PID" > .tmp/account.pid
    
    sleep 5
    
    print_success "All services started!"
    echo ""
    print_info "API Gateway: http://localhost:3000/api"
    print_info "Transaction Service: http://localhost:3001/api"
    print_info "Account Service: http://localhost:3002/api"
    echo ""
    print_info "Logs are saved in logs/ directory"
    print_info "Use './local-dev.sh stop-services' to stop all services"
}

# Stop services
stop_services() {
    print_header "🛑 Stopping All Services"
    
    if [ -f .tmp/gateway.pid ]; then
        kill $(cat .tmp/gateway.pid) 2>/dev/null || true
        rm .tmp/gateway.pid
    fi
    
    if [ -f .tmp/transaction.pid ]; then
        kill $(cat .tmp/transaction.pid) 2>/dev/null || true
        rm .tmp/transaction.pid
    fi
    
    if [ -f .tmp/account.pid ]; then
        kill $(cat .tmp/account.pid) 2>/dev/null || true
        rm .tmp/account.pid
    fi
    
    print_success "All services stopped!"
}

# Show status
show_status() {
    print_header "📊 System Status"
    
    echo -e "${BLUE}Docker Containers:${NC}"
    docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" | grep my_finance || echo "No containers running"
    
    echo ""
    echo -e "${BLUE}Local Services:${NC}"
    if [ -f .tmp/gateway.pid ] && kill -0 $(cat .tmp/gateway.pid) 2>/dev/null; then
        print_success "API Gateway: Running (PID: $(cat .tmp/gateway.pid))"
    else
        print_warning "API Gateway: Not running"
    fi
    
    if [ -f .tmp/transaction.pid ] && kill -0 $(cat .tmp/transaction.pid) 2>/dev/null; then
        print_success "Transaction Service: Running (PID: $(cat .tmp/transaction.pid))"
    else
        print_warning "Transaction Service: Not running"
    fi
    
    if [ -f .tmp/account.pid ] && kill -0 $(cat .tmp/account.pid) 2>/dev/null; then
        print_success "Account Service: Running (PID: $(cat .tmp/account.pid))"
    else
        print_warning "Account Service: Not running"
    fi
}

# Reset everything
reset_all() {
    print_header "🔄 Resetting Everything"
    
    stop_services
    stop_databases
    
    print_info "Removing Docker volumes..."
    docker volume prune -f
    
    print_info "Cleaning logs..."
    rm -rf logs/*.log
    rm -rf .tmp/*.pid
    
    print_success "Reset complete!"
}

# Create directories
setup_dirs() {
    mkdir -p logs
    mkdir -p .tmp
}

# Help
show_help() {
    echo -e "${BLUE}🚀 My Finance Local Development Helper${NC}"
    echo ""
    echo "Usage: ./local-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start, init          - Initialize local development environment"
    echo "  start-databases      - Start only databases (Docker containers)"
    echo "  stop-databases       - Stop databases"
    echo "  start-services       - Start all services in background"
    echo "  stop-services        - Stop all services"
    echo "  status               - Show system status"
    echo "  reset                - Reset everything (stop services, remove data)"
    echo "  help                 - Show this help"
    echo ""
    echo "Manual service commands:"
    echo "  npm run start:local:gateway      - Start API Gateway"
    echo "  npm run start:local:transaction  - Start Transaction Service"
    echo "  npm run start:local:account      - Start Account Service"
    echo ""
    echo "URLs:"
    echo "  API Gateway: http://localhost:3000/api"
    echo "  Transaction Service: http://localhost:3001/api"
    echo "  Account Service: http://localhost:3002/api"
    echo "  pgAdmin: http://localhost:5051"
    echo "  Mongo Express: http://localhost:8082"
    echo "  phpMyAdmin: http://localhost:8083"
}

# Main script
setup_dirs

case "${1:-help}" in
    "start"|"init")
        start_all
        ;;
    "start-databases"|"db")
        check_docker
        start_databases
        ;;
    "stop-databases"|"stop-db")
        stop_databases
        ;;
    "start-services"|"services")
        start_services
        ;;
    "stop-services"|"stop")
        stop_services
        ;;
    "status"|"ps")
        show_status
        ;;
    "reset"|"clean")
        reset_all
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac