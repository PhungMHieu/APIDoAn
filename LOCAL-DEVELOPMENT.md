# 🏠 LOCAL DEVELOPMENT GUIDE

## 🎯 Tổng Quan
Hướng dẫn chi tiết để chạy My Finance system hoàn toàn ở môi trường local (không Docker cho services, chỉ databases).

## 🚀 Quick Start

### 1. Chuẩn bị Databases (Docker)
```bash
# Khởi động databases với ports riêng biệt
./local-dev.sh start-databases

# Kiểm tra trạng thái
./local-dev.sh status
```

### 2. Chạy Services Locally

#### Option A: Manual (Recommended for Development)
Mở 3 terminals riêng biệt:

```bash
# Terminal 1 - API Gateway
cd my_finance
NODE_ENV=development npm run start:gateway
# Running on: http://localhost:3001

# Terminal 2 - Transaction Service  
cd my_finance
NODE_ENV=development npm run start:transaction
# Running on: http://localhost:3002

# Terminal 3 - Account Service
cd my_finance
NODE_ENV=development npm run start:account
# Running on: http://localhost:3003
```

#### Option B: Background (Auto start all)
```bash
# Start all services in background
./local-dev.sh start-services

# Stop all services
./local-dev.sh stop-services
```

## 🔧 Environment Configuration

### Auto-Detection
System tự động detect môi trường:
- `NODE_ENV=development` → Local ports (5433, 27018, 3307)
- `NODE_ENV=production` → Docker ports (5432, 27017, 3306)

### Local Database Ports
| Service | Database | Local Port | Container |
|---------|----------|------------|-----------|
| Transaction | PostgreSQL | **5433** | postgres-local |
| Account | MongoDB | **27018** | mongodb-local |
| Gateway | MySQL | **3307** | mysql-local |

### API Service Ports
| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3001 | http://localhost:3001 |
| Transaction Service | 3002 | http://localhost:3002 |
| Account Service | 3003 | http://localhost:3003 |

## 🎛️ Database Management UIs

### Local Development URLs
- **pgAdmin**: http://localhost:5051
- **Mongo Express**: http://localhost:8082
- **phpMyAdmin**: http://localhost:8083

### Credentials
```bash
# pgAdmin
Email: admin@myfinance.com
Password: admin123

# Mongo Express & phpMyAdmin
Username: admin
Password: admin123
```

## 📊 API Documentation

### Swagger UIs
- **API Gateway**: http://localhost:3001/api
- **Transaction Service**: http://localhost:3002/api
- **Account Service**: http://localhost:3003/api

## 🛠️ Helper Scripts

### Local Development Script
```bash
# Show help
./local-dev.sh help

# Start databases only
./local-dev.sh start-databases

# Start all services in background
./local-dev.sh start-services

# Stop services
./local-dev.sh stop-services

# Show status
./local-dev.sh status

# Reset everything
./local-dev.sh reset
```

### NPM Scripts
```bash
# Individual services (manual)
npm run start:gateway      # Port 3001
npm run start:transaction  # Port 3002
npm run start:account      # Port 3003

# With explicit development mode
npm run start:local:gateway
npm run start:local:transaction
npm run start:local:account

# Docker database management
npm run docker:local       # Start local databases
npm run docker:local:down  # Stop local databases
```

## 🔍 Development Workflow

### 1. Initial Setup
```bash
# Clone và install
git clone <repo>
cd my_finance
npm install

# Khởi động databases
./local-dev.sh start-databases
```

### 2. Daily Development
```bash
# Option 1: Auto start all
./local-dev.sh start-services

# Option 2: Manual control (recommended)
# Terminal 1
NODE_ENV=development npm run start:gateway

# Terminal 2  
NODE_ENV=development npm run start:transaction

# Terminal 3
NODE_ENV=development npm run start:account
```

### 3. Testing
```bash
# Swagger UIs
open http://localhost:3001/api  # Gateway
open http://localhost:3002/api  # Transaction
open http://localhost:3003/api  # Account

# Database UIs
open http://localhost:5051      # pgAdmin
open http://localhost:8082      # Mongo Express
open http://localhost:8083      # phpMyAdmin
```

## 🔧 Database Connections

### Direct Database Access
```bash
# PostgreSQL
psql -h localhost -p 5433 -U postgres -d transaction_db
# Password: postgres123

# MongoDB
mongosh "mongodb://admin:admin123@localhost:27018/account_db"

# MySQL
mysql -h localhost -P 3307 -u mysql_user -p gateway_db
# Password: mysql123
```

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using ports
lsof -i :5433  # PostgreSQL
lsof -i :27018 # MongoDB
lsof -i :3307  # MySQL

# Kill conflicting processes
sudo lsof -t -i:5433 | xargs kill -9
```

### Database Connection Issues
```bash
# Check container status
docker ps | grep my_finance_.*_local

# Restart databases
./local-dev.sh stop-databases
./local-dev.sh start-databases

# Check logs
docker logs my_finance_postgres_local
docker logs my_finance_mongodb_local
docker logs my_finance_mysql_local
```

### Service Issues
```bash
# Check if services are running
./local-dev.sh status

# View service logs (if using background mode)
tail -f logs/gateway.log
tail -f logs/transaction.log
tail -f logs/account.log
```

## ✅ Validation Checklist

- [ ] **Databases running**: `./local-dev.sh status`
- [ ] **PostgreSQL**: http://localhost:5051 (pgAdmin)
- [ ] **MongoDB**: http://localhost:8082 (Mongo Express)
- [ ] **MySQL**: http://localhost:8083 (phpMyAdmin)
- [ ] **API Gateway**: http://localhost:3001/api
- [ ] **Transaction Service**: http://localhost:3002/api
- [ ] **Account Service**: http://localhost:3003/api

## 🎯 Advantages của Local Development

### ✅ Pros
- **Fast restart**: Không cần rebuild Docker images
- **Live reload**: NestJS watch mode hoạt động perfect
- **Easy debugging**: Attach debugger trực tiếp
- **IDE integration**: IntelliSense, breakpoints work perfectly
- **Resource efficient**: Chỉ databases chạy trong Docker

### ⚠️ Considerations
- **Environment differences**: Local có thể khác production
- **Dependencies**: Cần Node.js, npm được cài local
- **Port management**: Cần quản lý ports tránh conflict

## 🔄 Switching Between Modes

### From Docker Production to Local Development
```bash
# Stop production containers
docker compose down

# Start local databases
./local-dev.sh start-databases

# Start services locally
NODE_ENV=development npm run start:gateway
```

### From Local Development to Docker Production
```bash
# Stop local services
./local-dev.sh stop-services

# Stop local databases  
./local-dev.sh stop-databases

# Start production environment
docker compose up -d
```

---
*Perfect cho development workflow! 🚀*