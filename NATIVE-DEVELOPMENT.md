# 🍎 COMPLETE NATIVE macOS DEVELOPMENT GUIDE

## 🎯 Tổng Quan
Hướng dẫn hoàn chỉnh để chạy My Finance system với databases được cài trực tiếp trên macOS (không dùng Docker).

## 🚀 Quick Start

### 1. Kiểm tra Databases đã cài chưa
```bash
# Kiểm tra status
./native-db.sh status

# Nếu chưa cài, install qua Homebrew
./native-db.sh install
```

### 2. Khởi động Databases
```bash
# Start tất cả databases
./native-db.sh start

# Hoặc dùng npm script
npm run native:db:start
```

### 3. Setup Databases (lần đầu)
```bash
# Tạo databases, users, permissions
./native-db.sh setup-dbs

# Hoặc dùng npm script  
npm run native:db:setup
```

### 4. Test Connections
```bash
# Test kết nối tất cả databases
./native-db.sh test

# Hoặc dùng npm script
npm run native:db:test
```

### 5. Chạy Services
Mở 3 terminals riêng biệt:
```bash
# Terminal 1 - API Gateway
npm run start:native:gateway
# Running on: http://localhost:3000

# Terminal 2 - Transaction Service
npm run start:native:transaction  
# Running on: http://localhost:3001

# Terminal 3 - Account Service
npm run start:native:account
# Running on: http://localhost:3002
```

## 🔧 Environment Configuration

### Native Database Configuration (.env.native)
```bash
# API Service Ports  
API_GATEWAY_PORT=3000
TRANSACTION_SVC_PORT=3001
ACCOUNT_SVC_PORT=3002

# PostgreSQL (Native)
TRANSACTION_DB_HOST=localhost
TRANSACTION_DB_PORT=5432
TRANSACTION_DB_USERNAME=postgres
TRANSACTION_DB_PASSWORD=postgres

# MongoDB (Native)
ACCOUNT_DB_HOST=localhost
ACCOUNT_DB_PORT=27017
MONGODB_URI=mongodb://admin:admin123@localhost:27017/account_db?authSource=admin

# MySQL (Native)
GATEWAY_DB_HOST=localhost
GATEWAY_DB_PORT=3306
GATEWAY_DB_USERNAME=root
GATEWAY_DB_PASSWORD=root
```

## 📊 Default Connections

| Service | Database | Port | User | Password |
|---------|----------|------|------|----------|
| Transaction | PostgreSQL | 5432 | postgres | postgres |
| Account | MongoDB | 27017 | admin | admin123 |
| Gateway | MySQL | 3306 | root | root |

## 🛠️ Management Scripts

### Native Database Scripts
```bash
# Database management
./native-db.sh start           # Start all databases
./native-db.sh stop            # Stop all databases  
./native-db.sh restart         # Restart all databases
./native-db.sh status          # Show status
./native-db.sh test            # Test connections
./native-db.sh setup-dbs       # Setup databases (first time)
./native-db.sh logs            # Show logs

# Individual database control
./native-db.sh start-postgres  # PostgreSQL only
./native-db.sh start-mongodb   # MongoDB only
./native-db.sh start-mysql     # MySQL only
```

### NPM Scripts
```bash
# Native database management
npm run native:db:start        # Start databases
npm run native:db:stop         # Stop databases
npm run native:db:status       # Check status
npm run native:db:test         # Test connections
npm run native:db:setup        # Setup databases

# Native service development
npm run start:native:gateway      # API Gateway
npm run start:native:transaction  # Transaction Service  
npm run start:native:account      # Account Service
```

## 🔍 Manual Database Setup

### PostgreSQL Setup
```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U $(whoami) -d postgres

# Create database and user
CREATE DATABASE transaction_db;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE transaction_db TO postgres;
\q
```

### MongoDB Setup  
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# Create admin user
use admin
db.createUser({
  user: "admin", 
  pwd: "admin123",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create database
use account_db
db.createCollection("accounts")
exit
```

### MySQL Setup
```bash
# Connect to MySQL
mysql -h localhost -P 3306 -u root -p

# Create database and user
CREATE DATABASE gateway_db;
CREATE USER 'mysql_user'@'localhost' IDENTIFIED BY 'mysql123';
GRANT ALL PRIVILEGES ON gateway_db.* TO 'mysql_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🎯 Development Workflow

### Daily Development
```bash
# 1. Start databases
npm run native:db:start

# 2. Check status  
npm run native:db:status

# 3. Start services (3 terminals)
npm run start:native:gateway      # Terminal 1
npm run start:native:transaction  # Terminal 2  
npm run start:native:account      # Terminal 3
```

### Testing APIs
```bash
# API Documentation
open http://localhost:3000/api  # Gateway Swagger
open http://localhost:3001/api  # Transaction Swagger
open http://localhost:3002/api  # Account Swagger

# Quick API test
curl http://localhost:3000      # Gateway health
curl http://localhost:3001      # Transaction health
curl http://localhost:3002      # Account health
```

## 🔧 Database Management UIs

### Native GUI Tools
```bash
# PostgreSQL
pgAdmin 4:    brew install --cask pgadmin4
Postico:      https://eggerapps.at/postico/

# MongoDB  
Compass:      brew install --cask mongodb-compass
Connection:   mongodb://admin:admin123@localhost:27017/account_db

# MySQL
Sequel Pro:   brew install --cask sequel-pro
TablePlus:    brew install --cask tableplus
Workbench:    brew install --cask mysqlworkbench
```

## 🐛 Troubleshooting

### Database Won't Start
```bash
# Check what's using ports
lsof -i :5432   # PostgreSQL
lsof -i :27017  # MongoDB
lsof -i :3306   # MySQL

# Restart services
brew services restart postgresql@15
brew services restart mongodb-community@7.0  
brew services restart mysql@8.0

# Check logs
./native-db.sh logs
```

### Connection Refused
```bash
# Verify services are running
./native-db.sh status

# Test individual connections
psql -h localhost -p 5432 -U postgres -d postgres
mongosh mongodb://localhost:27017
mysql -h localhost -P 3306 -u root -p
```

### Permission Errors
```bash
# Fix PostgreSQL permissions
sudo chown -R $(whoami) /usr/local/var/postgres/

# Fix MongoDB permissions
sudo chown -R $(whoami) /usr/local/var/mongodb/

# Fix MySQL permissions  
sudo chown -R $(whoami) /usr/local/var/mysql/
```

### Port Conflicts
```bash
# Kill processes using default ports
sudo lsof -t -i:5432 | xargs kill -9   # PostgreSQL
sudo lsof -t -i:27017 | xargs kill -9  # MongoDB  
sudo lsof -t -i:3306 | xargs kill -9   # MySQL
```

## ✅ Validation Checklist

### Database Setup
- [ ] **PostgreSQL running**: `lsof -i :5432`
- [ ] **MongoDB running**: `lsof -i :27017`
- [ ] **MySQL running**: `lsof -i :3306`
- [ ] **Connections work**: `./native-db.sh test`

### Service Setup  
- [ ] **Gateway accessible**: http://localhost:3000/api
- [ ] **Transaction accessible**: http://localhost:3001/api
- [ ] **Account accessible**: http://localhost:3002/api

## 🎯 Advantages of Native Development

### ✅ Pros
- **Maximum performance**: No Docker overhead
- **Native debugging**: Full IDE integration
- **Live reload**: Perfect NestJS watch mode
- **Resource efficient**: Minimal memory usage
- **Easy access**: Native GUI tools integration

### ⚠️ Considerations  
- **Environment setup**: Requires database installation
- **Port management**: Need to avoid conflicts
- **Mac-specific**: Setup differs on other OS

## 🔄 Multiple Environment Support

### Switch Between Environments
```bash
# Native macOS databases
npm run start:native:gateway

# Docker databases (local ports)
npm run start:local:gateway  

# Full Docker (production)
npm run docker:up
```

---
*Perfect native macOS development setup! 🚀*