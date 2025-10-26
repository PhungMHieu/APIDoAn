#!/bin/bash

# 🍎 Native macOS Database Management Script
# For databases installed directly on macOS (not Docker)

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

# Check if Homebrew is installed
check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed. Please install it first:"
        echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
}

# Check database services
check_postgres() {
    if brew services list | grep -q "postgresql.*started"; then
        print_success "PostgreSQL is running"
        return 0
    else
        print_warning "PostgreSQL is not running"
        return 1
    fi
}

check_mongodb() {
    if brew services list | grep -q "mongodb.*started"; then
        print_success "MongoDB is running"
        return 0
    else
        print_warning "MongoDB is not running"
        return 1
    fi
}

check_mysql() {
    if brew services list | grep -q "mysql.*started"; then
        print_success "MySQL is running"
        return 0
    else
        print_warning "MySQL is not running"
        return 1
    fi
}

# Start services
start_postgres() {
    print_info "Starting PostgreSQL..."
    if brew services list | grep -q "postgresql@15"; then
        brew services start postgresql@15
    elif brew services list | grep -q "postgresql"; then
        brew services start postgresql
    else
        print_error "PostgreSQL not found. Please install it first."
        return 1
    fi
}

start_mongodb() {
    print_info "Starting MongoDB..."
    if brew services list | grep -q "mongodb-community"; then
        brew services start mongodb-community@7.0
    else
        print_error "MongoDB not found. Please install it first."
        return 1
    fi
}

start_mysql() {
    print_info "Starting MySQL..."
    if brew services list | grep -q "mysql@8.0"; then
        brew services start mysql@8.0
    elif brew services list | grep -q "mysql"; then
        brew services start mysql
    else
        print_error "MySQL not found. Please install it first."
        return 1
    fi
}

# Stop services
stop_postgres() {
    print_info "Stopping PostgreSQL..."
    if brew services list | grep -q "postgresql@15.*started"; then
        brew services stop postgresql@15
    elif brew services list | grep -q "postgresql.*started"; then
        brew services stop postgresql
    fi
}

stop_mongodb() {
    print_info "Stopping MongoDB..."
    if brew services list | grep -q "mongodb-community.*started"; then
        brew services stop mongodb-community@7.0
    fi
}

stop_mysql() {
    print_info "Stopping MySQL..."
    if brew services list | grep -q "mysql@8.0.*started"; then
        brew services stop mysql@8.0
    elif brew services list | grep -q "mysql.*started"; then
        brew services stop mysql
    fi
}

# Start all databases
start_all() {
    print_header "🚀 Starting Native macOS Databases"
    check_homebrew
    
    start_postgres
    start_mongodb
    start_mysql
    
    sleep 3
    
    print_success "All databases started!"
    show_status
}

# Stop all databases
stop_all() {
    print_header "🛑 Stopping Native macOS Databases"
    
    stop_postgres
    stop_mongodb
    stop_mysql
    
    print_success "All databases stopped!"
}

# Show status
show_status() {
    print_header "📊 Database Status"
    
    echo -e "${BLUE}Homebrew Services:${NC}"
    brew services list | grep -E "(postgresql|mongodb|mysql)" || echo "No database services found"
    
    echo ""
    echo -e "${BLUE}Port Status:${NC}"
    
    # Check PostgreSQL port
    if lsof -i :5432 &> /dev/null; then
        print_success "PostgreSQL: localhost:5432 (Active)"
    else
        print_warning "PostgreSQL: localhost:5432 (Not responding)"
    fi
    
    # Check MongoDB port
    if lsof -i :27017 &> /dev/null; then
        print_success "MongoDB: localhost:27017 (Active)"
    else
        print_warning "MongoDB: localhost:27017 (Not responding)"
    fi
    
    # Check MySQL port
    if lsof -i :3306 &> /dev/null; then
        print_success "MySQL: localhost:3306 (Active)"
    else
        print_warning "MySQL: localhost:3306 (Not responding)"
    fi
}

# Test connections
test_connections() {
    print_header "🔍 Testing Database Connections"
    
    # Test PostgreSQL
    print_info "Testing PostgreSQL connection..."
    if psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT version();" &> /dev/null; then
        print_success "PostgreSQL connection: OK"
    else
        print_error "PostgreSQL connection: FAILED"
        print_info "Try: psql -h localhost -p 5432 -U postgres -d postgres"
    fi
    
    # Test MongoDB
    print_info "Testing MongoDB connection..."
    if mongosh --host localhost:27017 --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB connection: OK"
    else
        print_error "MongoDB connection: FAILED"
        print_info "Try: mongosh mongodb://localhost:27017"
    fi
    
    # Test MySQL
    print_info "Testing MySQL connection..."
    if mysql -h localhost -P 3306 -u root -e "SELECT version();" &> /dev/null; then
        print_success "MySQL connection: OK"
    else
        print_error "MySQL connection: FAILED"
        print_info "Try: mysql -h localhost -P 3306 -u root -p"
    fi
}

# Install databases
install_all() {
    print_header "📦 Installing Native macOS Databases"
    check_homebrew
    
    print_info "Installing PostgreSQL..."
    brew install postgresql@15
    
    print_info "Installing MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    
    print_info "Installing MySQL..."
    brew install mysql@8.0
    
    print_success "All databases installed!"
    print_info "Next steps:"
    echo "1. Run: ./native-db.sh start"
    echo "2. Run: ./native-db.sh setup-dbs"
    echo "3. Run: ./native-db.sh test"
}

# Setup databases (create users, databases)
setup_databases() {
    print_header "⚙️  Setting up Databases"
    
    # PostgreSQL setup
    print_info "Setting up PostgreSQL..."
    echo "
    -- PostgreSQL setup
    CREATE DATABASE IF NOT EXISTS transaction_db;
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
            CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
        END IF;
    END
    \$\$;
    GRANT ALL PRIVILEGES ON DATABASE transaction_db TO postgres;
    " | psql -h localhost -p 5432 -U $(whoami) -d postgres
    
    # MongoDB setup
    print_info "Setting up MongoDB..."
    mongosh --host localhost:27017 --eval "
    use admin;
    try {
        db.createUser({
            user: 'admin',
            pwd: 'admin123',
            roles: ['userAdminAnyDatabase', 'dbAdminAnyDatabase', 'readWriteAnyDatabase']
        });
    } catch(e) {
        print('User admin already exists');
    }
    use account_db;
    db.createCollection('accounts');
    "
    
    # MySQL setup
    print_info "Setting up MySQL..."
    mysql -h localhost -P 3306 -u root -e "
    CREATE DATABASE IF NOT EXISTS gateway_db;
    CREATE USER IF NOT EXISTS 'mysql_user'@'localhost' IDENTIFIED BY 'mysql123';
    GRANT ALL PRIVILEGES ON gateway_db.* TO 'mysql_user'@'localhost';
    FLUSH PRIVILEGES;
    "
    
    print_success "Database setup complete!"
}

# Show help
show_help() {
    echo -e "${BLUE}🍎 Native macOS Database Management${NC}"
    echo ""
    echo "Usage: ./native-db.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install              - Install all databases via Homebrew"
    echo "  start, up            - Start all database services"
    echo "  stop, down           - Stop all database services"
    echo "  restart              - Restart all database services"
    echo "  status, ps           - Show status of all services"
    echo "  test                 - Test database connections"
    echo "  setup-dbs            - Setup databases, users, and permissions"
    echo "  logs                 - Show recent logs"
    echo "  help                 - Show this help"
    echo ""
    echo "Individual services:"
    echo "  start-postgres       - Start PostgreSQL only"
    echo "  start-mongodb        - Start MongoDB only"
    echo "  start-mysql          - Start MySQL only"
    echo "  stop-postgres        - Stop PostgreSQL only"
    echo "  stop-mongodb         - Stop MongoDB only"
    echo "  stop-mysql           - Stop MySQL only"
    echo ""
    echo "Connection info:"
    echo "  PostgreSQL: localhost:5432"
    echo "  MongoDB: localhost:27017"
    echo "  MySQL: localhost:3306"
}

# Show logs
show_logs() {
    print_header "📋 Recent Database Logs"
    
    echo -e "${BLUE}PostgreSQL Logs:${NC}"
    if [ -f "/usr/local/var/log/postgres.log" ]; then
        tail -10 /usr/local/var/log/postgres.log
    else
        echo "No PostgreSQL logs found"
    fi
    
    echo ""
    echo -e "${BLUE}MongoDB Logs:${NC}"
    if [ -f "/usr/local/var/log/mongodb/mongo.log" ]; then
        tail -10 /usr/local/var/log/mongodb/mongo.log
    else
        echo "No MongoDB logs found"
    fi
    
    echo ""
    echo -e "${BLUE}MySQL Logs:${NC}"
    if ls /usr/local/var/mysql/*.err 1> /dev/null 2>&1; then
        tail -10 /usr/local/var/mysql/*.err
    else
        echo "No MySQL logs found"
    fi
}

# Main script
case "${1:-help}" in
    "install")
        install_all
        ;;
    "start"|"up")
        start_all
        ;;
    "stop"|"down")
        stop_all
        ;;
    "restart")
        stop_all
        sleep 2
        start_all
        ;;
    "status"|"ps")
        show_status
        ;;
    "test")
        test_connections
        ;;
    "setup-dbs"|"setup")
        setup_databases
        ;;
    "logs")
        show_logs
        ;;
    "start-postgres")
        start_postgres
        ;;
    "start-mongodb")
        start_mongodb
        ;;
    "start-mysql")
        start_mysql
        ;;
    "stop-postgres")
        stop_postgres
        ;;
    "stop-mongodb")
        stop_mongodb
        ;;
    "stop-mysql")
        stop_mysql
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