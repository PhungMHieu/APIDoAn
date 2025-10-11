# My Finance - Docker Setup

## 📦 Docker Environment

Dự án hỗ trợ 2 môi trường Docker:

### 1. Full Production Environment
Chạy toàn bộ hệ thống trong Docker containers:
```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở background
docker-compose up -d --build

# Dừng tất cả services
docker-compose down

# Xóa volumes (reset data)
docker-compose down -v
```

### 2. Local Development Environment
Chỉ chạy databases và UI tools, services chạy local:
```bash
# Chạy databases cho development
docker-compose -f docker-compose.local.yml up -d

# Dừng databases
docker-compose -f docker-compose.local.yml down
```

## 🔗 Service URLs

### Production Environment (Full Docker)
- **API Gateway**: http://localhost:3000
- **Transaction Service**: http://localhost:3001  
- **Account Service**: http://localhost:3002

### Database UI Tools
- **pgAdmin (PostgreSQL)**: http://localhost:5050
  - Email: `admin@myfinance.com`
  - Password: `admin123`
- **Mongo Express (MongoDB)**: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`
- **phpMyAdmin (MySQL)**: http://localhost:8080
  - Username: `mysql_user`
  - Password: `mysql123`

### Local Development Environment
- **pgAdmin**: http://localhost:5051
- **Mongo Express**: http://localhost:8082
- **phpMyAdmin**: http://localhost:8083

## 📊 Database Connections

### PostgreSQL (Transaction Service)
```
Host: localhost
Port: 5432 (production) / 5433 (local)
Database: transaction_db
Username: postgres
Password: postgres123
```

### MongoDB (Account Service)
```
Host: localhost
Port: 27017 (production) / 27018 (local)
Database: account_db
Username: admin
Password: admin123
Connection String: mongodb://admin:admin123@localhost:27017/account_db
```

### MySQL (API Gateway)
```
Host: localhost
Port: 3306 (production) / 3307 (local)
Database: gateway_db
Username: mysql_user
Password: mysql123
```

## 🚀 Quick Start

### For Development (Recommended)
1. Start databases only:
```bash
docker-compose -f docker-compose.local.yml up -d
```

2. Run services locally:
```bash
# Terminal 1 - Transaction Service
npm run start:transaction

# Terminal 2 - Account Service  
npm run start:account

# Terminal 3 - API Gateway
npm run start:gateway
```

### For Production Testing
1. Build and run everything:
```bash
docker-compose up --build
```

2. Access services at the URLs above

## 🔧 Environment Variables

Services sử dụng environment variables khác nhau cho Docker và local:

### Docker Environment
- Database hosts: `postgres-db`, `mongodb`, `mysql-db`
- Internal network communication

### Local Development  
- Database hosts: `localhost`
- Different ports to avoid conflicts
- Direct host machine access

## 📝 Database Sample Data

Mỗi database được khởi tạo với sample data:
- **PostgreSQL**: Sample transactions
- **MongoDB**: Sample user accounts  
- **MySQL**: API gateway logs and keys

## 🐛 Troubleshooting

### Port Conflicts
Nếu gặp lỗi port đã được sử dụng:
```bash
# Check ports being used
lsof -i :3000,:3001,:3002,:5432,:27017,:3306

# Kill processes if needed
sudo lsof -t -i:PORT | xargs kill -9
```

### Database Connection Issues
1. Kiểm tra containers đang chạy:
```bash
docker ps
```

2. Xem logs của container:
```bash
docker logs [container_name]
```

3. Reset database volumes:
```bash
docker-compose down -v
docker-compose up --build
```

### Build Issues
```bash
# Clean build
docker system prune -a
docker-compose build --no-cache
```

## 📚 API Documentation

Swagger UI có sẵn tại:
- **Production**: http://localhost:3000/api (Gateway)
- **Development**: 
  - Transaction: http://localhost:3001/api
  - Account: http://localhost:3002/api  
  - Gateway: http://localhost:3000/api