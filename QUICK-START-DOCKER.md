# 🚀 Quick Start - Deploy Auth Service với Docker

## Bước 1: Start Docker Desktop

Mở Docker Desktop trước khi chạy.

## Bước 2: Deploy

```bash
./docker-deploy.sh deploy
```

Chờ khoảng 2-3 phút để build và start tất cả services.

## Bước 3: Verify

```bash
# Check status
./docker-deploy.sh status

# Should see:
# ✅ auth-service running
# ✅ postgres-auth-db running
# ✅ All other services running
```

## Bước 4: Test

Mở browser:

```
http://localhost:3003/api
```

Bạn sẽ thấy Swagger UI với đầy đủ Auth Service endpoints!

## Bước 5: Use

1. **Register** user qua `/auth/register`
2. **Login** để lấy JWT token
3. Click **Authorize** 🔒 và paste token
4. Test các **protected endpoints**

## 🎉 Done!

Auth Service đã chạy trong Docker với:
- ✅ PostgreSQL database
- ✅ JWT authentication  
- ✅ Swagger documentation
- ✅ Full CRUD operations
- ✅ Role-based authorization

## 📋 Available Commands

```bash
./docker-deploy.sh deploy   # Deploy tất cả
./docker-deploy.sh start    # Start services
./docker-deploy.sh stop     # Stop services  
./docker-deploy.sh logs     # View logs
./docker-deploy.sh status   # Check status
./docker-deploy.sh clean    # Clean up
```

## 🔗 URLs

| Service | URL |
|---------|-----|
| Auth Service | http://localhost:3003 |
| Swagger UI | http://localhost:3003/api |
| API Gateway | http://localhost:3000 |
| Transaction | http://localhost:3001 |
| Account | http://localhost:3002 |
| pgAdmin | http://localhost:5050 |

Xem thêm chi tiết trong `DOCKER-DEPLOYMENT.md` và `AUTH-DOCKER-COMPLETE.md`!
