# 🐳 Docker Deployment Guide

Hướng dẫn triển khai My Finance với Docker, bao gồm Auth Service.

## 📦 Services trong Docker

| Service | Port | Description | Swagger |
|---------|------|-------------|---------|
| API Gateway | 3000 | Main gateway | - |
| Transaction Service | 3001 | Transaction management | - |
| Account Service | 3002 | Account management | - |
| **Auth Service** | **3003** | **Authentication & Authorization** | **✅ /api** |

## 🗄️ Databases

| Database | Port | Type | Service |
|----------|------|------|---------|
| PostgreSQL (Transaction) | 5432 | PostgreSQL 15 | Transaction Service |
| **PostgreSQL (Auth)** | **5433** | **PostgreSQL 15** | **Auth Service** |
| MongoDB | 27017 | MongoDB 7.0 | Account Service |
| MySQL | 3306 | MySQL 8.0 | API Gateway |
| Redis | 6379 | Redis 7 | Caching |

## 🔧 Management Tools

| Tool | Port | Credentials |
|------|------|-------------|
| pgAdmin | 5050 | admin@myfinance.com / admin123 |
| phpMyAdmin | 8080 | mysql_user / mysql123 |
| Mongo Express | 8081 | admin / admin123 |

## 🚀 Quick Start

### 1. Deploy tất cả services

```bash
./docker-deploy.sh deploy
```

Lệnh này sẽ:
- Clean up containers cũ
- Build tất cả images
- Start tất cả services
- Show status và URLs

### 2. Hoặc từng bước

```bash
# Build images
./docker-deploy.sh build

# Start services
./docker-deploy.sh start

# Check status
./docker-deploy.sh status
```

## 📋 Available Commands

```bash
./docker-deploy.sh deploy   # Clean, build và deploy tất cả
./docker-deploy.sh start    # Start services
./docker-deploy.sh stop     # Stop services
./docker-deploy.sh restart  # Restart services
./docker-deploy.sh build    # Build Docker images
./docker-deploy.sh clean    # Remove containers và volumes
./docker-deploy.sh logs     # Show logs
./docker-deploy.sh status   # Show status và URLs
```

## 🧪 Test Auth Service sau khi deploy

### 1. Check Swagger UI

```bash
open http://localhost:3003/api
```

### 2. Register user

```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 4. Test protected endpoint

```bash
# Lưu token từ login response
export TOKEN="your_access_token_here"

# Get profile
curl -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Monitor Services

### View logs của tất cả services

```bash
./docker-deploy.sh logs
```

### View logs của service cụ thể

```bash
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
docker-compose logs -f transaction-service
docker-compose logs -f account-service
```

### Check container status

```bash
docker-compose ps
```

### Check resource usage

```bash
docker stats
```

## 🔍 Troubleshooting

### Service không start

```bash
# Check logs
docker-compose logs auth-service

# Restart specific service
docker-compose restart auth-service

# Rebuild specific service
docker-compose up -d --build auth-service
```

### Database connection issues

```bash
# Check database containers
docker-compose ps postgres-auth-db
docker-compose ps postgres-db
docker-compose ps mongodb
docker-compose ps mysql-db

# Check database logs
docker-compose logs postgres-auth-db
```

### Port conflicts

Nếu port bị conflict, edit `docker-compose.yml`:

```yaml
auth-service:
  ports:
    - "3004:3003"  # Change left side port
```

### Clean slate restart

```bash
# Stop and remove everything
./docker-deploy.sh clean

# Full redeploy
./docker-deploy.sh deploy
```

## 🏗️ Docker Architecture

```
┌─────────────────────────────────────────────────┐
│              API Gateway (3000)                  │
│         MySQL (3306) + phpMyAdmin (8080)         │
└─────┬───────────────┬──────────────┬────────────┘
      │               │              │
      ▼               ▼              ▼
┌─────────────┐ ┌────────────┐ ┌────────────────┐
│Transaction  │ │  Account   │ │  Auth Service  │
│  Service    │ │  Service   │ │    (3003)      │
│   (3001)    │ │   (3002)   │ │  + Swagger     │
└─────┬───────┘ └─────┬──────┘ └────────┬───────┘
      │               │                  │
      ▼               ▼                  ▼
┌────────────┐  ┌──────────┐   ┌──────────────┐
│PostgreSQL  │  │ MongoDB  │   │ PostgreSQL   │
│   (5432)   │  │ (27017)  │   │   (5433)     │
│+ pgAdmin   │  │+ Mongo   │   │              │
│  (5050)    │  │Express   │   │              │
│            │  │ (8081)   │   │              │
└────────────┘  └──────────┘   └──────────────┘
```

## 🔐 Environment Variables

All services use environment variables defined in `docker-compose.yml`:

```yaml
auth-service:
  environment:
    NODE_ENV: production
    AUTH_SVC_PORT: 3003
    AUTH_DB_HOST: postgres-auth-db
    AUTH_DB_PORT: 5432
    AUTH_DB_NAME: auth_db
    AUTH_DB_USERNAME: postgres
    AUTH_DB_PASSWORD: postgres123
    JWT_SECRET: my-super-secret-key-change-in-production
    JWT_EXPIRES_IN: 24h
```

**⚠️ Security Note:** Change JWT_SECRET và database passwords trong production!

## 📝 Custom Configuration

### Tạo `.env` file (optional)

```bash
# Database
AUTH_DB_PASSWORD=your_secure_password
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_key_at_least_32_characters
JWT_EXPIRES_IN=24h

# Ports (if changed)
AUTH_SVC_PORT=3003
```

### Use custom compose file

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🎯 Production Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup for databases
- [ ] Use environment variables file
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up health checks

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Auth Service README](./apps/auth-svc/README.md)
- [API Tests](./apps/auth-svc/API-TESTS.md)
- [Swagger Documentation](http://localhost:3003/api)

## 🎉 Success!

Sau khi deploy thành công, bạn có thể:

1. ✅ Access Auth Service Swagger: http://localhost:3003/api
2. ✅ Test authentication endpoints
3. ✅ Monitor với management tools
4. ✅ View logs realtime
5. ✅ Scale services nếu cần

## 🔄 Updates và Maintenance

### Update một service

```bash
# Rebuild và restart
docker-compose up -d --build auth-service
```

### Backup database

```bash
# Backup auth database
docker exec my_finance_postgres_auth pg_dump -U postgres auth_db > backup_auth.sql

# Restore
docker exec -i my_finance_postgres_auth psql -U postgres auth_db < backup_auth.sql
```

### Scale services

```bash
docker-compose up -d --scale auth-service=3
```

Enjoy your fully Dockerized My Finance application! 🚀
