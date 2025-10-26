# 🎉 Auth Service Docker Deployment - COMPLETE!

## ✅ Hoàn thành

Auth Service đã được tích hợp đầy đủ vào Docker deployment với:

### 1. **Docker Configuration** ✅
- ✅ PostgreSQL riêng cho Auth Service (port 5433)
- ✅ Auth Service container với Dockerfile.auth
- ✅ Environment variables configuration
- ✅ Network và volume setup
- ✅ Dependencies với postgres-auth-db

### 2. **Deployment Script** ✅
- ✅ `docker-deploy.sh` - One-command deployment
- ✅ Support cả docker-compose và docker compose v2
- ✅ Commands: deploy, start, stop, restart, build, clean, logs, status
- ✅ Auto-detect Docker Compose version

### 3. **Documentation** ✅
- ✅ DOCKER-DEPLOYMENT.md - Chi tiết deployment guide
- ✅ Architecture diagram
- ✅ Troubleshooting guide
- ✅ Production checklist

### 4. **Services trong Docker** ✅

| Service | Port | Status |
|---------|------|--------|
| Auth Service | 3003 | ✅ Ready |
| Swagger UI | 3003/api | ✅ Ready |
| PostgreSQL (Auth) | 5433 | ✅ Ready |
| API Gateway | 3000 | ✅ Ready |
| Transaction Service | 3001 | ✅ Ready |
| Account Service | 3002 | ✅ Ready |
| pgAdmin | 5050 | ✅ Ready |
| phpMyAdmin | 8080 | ✅ Ready |
| Mongo Express | 8081 | ✅ Ready |

## 🚀 Quick Start

### Deploy tất cả (Recommended)

```bash
./docker-deploy.sh deploy
```

Lệnh này sẽ:
1. Clean up containers cũ
2. Build tất cả Docker images
3. Start tất cả services
4. Show status và URLs

### Hoặc từng bước

```bash
# 1. Validate configuration
docker compose config --quiet

# 2. Build images
./docker-deploy.sh build

# 3. Start services
./docker-deploy.sh start

# 4. Check status
./docker-deploy.sh status

# 5. View logs
./docker-deploy.sh logs
```

## 📡 Service URLs

Sau khi deploy, truy cập:

### Main Services
- 🔐 **Auth Service**: http://localhost:3003
  - 📚 **Swagger**: http://localhost:3003/api
- 🌐 API Gateway: http://localhost:3000
- 💰 Transaction Service: http://localhost:3001
- 👤 Account Service: http://localhost:3002

### Management Tools
- 🐘 pgAdmin: http://localhost:5050 (admin@myfinance.com / admin123)
- 🐬 phpMyAdmin: http://localhost:8080
- 🍃 Mongo Express: http://localhost:8081 (admin / admin123)

## 🧪 Test Auth Service

### 1. Via Swagger UI (Recommended)

```bash
open http://localhost:3003/api
```

- Register user
- Login để lấy token
- Click "Authorize" 🔒
- Test protected endpoints

### 2. Via cURL

```bash
# Register
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Get profile (replace TOKEN)
curl -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Monitor Services

```bash
# View all logs
./docker-deploy.sh logs

# View specific service
docker compose logs -f auth-service

# Check container status
docker compose ps

# Check resource usage
docker stats
```

## 🔧 Common Commands

```bash
# Stop all services
./docker-deploy.sh stop

# Restart all services
./docker-deploy.sh restart

# Clean and redeploy
./docker-deploy.sh clean
./docker-deploy.sh deploy

# Check status
./docker-deploy.sh status
```

## 🏗️ Architecture

```
┌────────────────────────────────────────────┐
│         API Gateway (3000)                  │
│         MySQL (3306)                        │
└──────┬──────────────┬───────────────┬──────┘
       │              │               │
       ▼              ▼               ▼
┌─────────────┐ ┌──────────┐ ┌────────────────┐
│Transaction  │ │ Account  │ │  Auth Service  │
│  (3001)     │ │  (3002)  │ │     (3003)     │
│             │ │          │ │  + Swagger UI  │
└──────┬──────┘ └─────┬────┘ └────────┬───────┘
       │              │               │
       ▼              ▼               ▼
┌────────────┐ ┌───────────┐ ┌──────────────┐
│PostgreSQL  │ │  MongoDB  │ │ PostgreSQL   │
│   (5432)   │ │  (27017)  │ │   (5433)     │
└────────────┘ └───────────┘ └──────────────┘
```

## 📝 Environment Variables

Auth Service trong Docker:

```yaml
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

**⚠️ Important**: Change JWT_SECRET và passwords trong production!

## 🎯 Production Checklist

- [ ] Change tất cả default passwords
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Setup monitoring
- [ ] Configure backup
- [ ] Use secrets management
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Setup health checks

## 🔍 Troubleshooting

### Service không start

```bash
# Check logs
docker compose logs auth-service

# Restart
docker compose restart auth-service

# Rebuild
docker compose up -d --build auth-service
```

### Port conflicts

Edit `docker-compose.yml`:
```yaml
auth-service:
  ports:
    - "3004:3003"  # Change external port
```

### Database connection issues

```bash
# Check database
docker compose ps postgres-auth-db
docker compose logs postgres-auth-db

# Restart database
docker compose restart postgres-auth-db
```

### Clean slate

```bash
./docker-deploy.sh clean
./docker-deploy.sh deploy
```

## 📚 Documentation

- [Docker Deployment Guide](./DOCKER-DEPLOYMENT.md)
- [Auth Service README](./apps/auth-svc/README.md)
- [API Tests](./apps/auth-svc/API-TESTS.md)
- [Swagger Complete](./SWAGGER-COMPLETE.md)

## 🎊 Success Metrics

✅ Docker compose config validated  
✅ Auth Service Dockerfile created  
✅ PostgreSQL dedicated for Auth  
✅ Swagger UI accessible  
✅ All ports configured  
✅ Deployment script working  
✅ Documentation complete  

## 🚀 Ready to Deploy!

Your My Finance application with Auth Service is ready for Docker deployment!

```bash
# Just run this:
./docker-deploy.sh deploy

# Wait for services to start
# Then visit: http://localhost:3003/api
```

**That's it! Enjoy your Dockerized Auth Service! 🎉**
