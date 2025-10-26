# Auth Service - Hoàn thành ✅

## 📦 Những gì đã tạo

### 1. Auth Service Structure
```
apps/auth-svc/
├── src/
│   ├── auth-svc.controller.ts     ✅ Controller với 5 endpoints
│   ├── auth-svc.module.ts         ✅ Module với JWT & TypeORM config
│   ├── auth.service.ts            ✅ Service xử lý auth logic
│   ├── main.ts                    ✅ Entry point
│   ├── decorators/
│   │   └── roles.decorator.ts     ✅ @Roles() decorator
│   ├── dto/
│   │   ├── login.dto.ts           ✅ Login DTO
│   │   ├── register.dto.ts        ✅ Register DTO
│   │   └── validate-token.dto.ts  ✅ Validate DTO
│   ├── entities/
│   │   └── user.entity.ts         ✅ User entity với roles
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      ✅ JWT Guard
│   │   └── roles.guard.ts         ✅ Roles Guard
│   └── strategies/
│       └── jwt.strategy.ts        ✅ JWT Strategy
├── test/
│   ├── app.e2e-spec.ts            ✅ E2E tests
│   └── jest-e2e.json              ✅ Jest config
├── tsconfig.app.json              ✅ TypeScript config
├── README.md                      ✅ Documentation
└── API-TESTS.md                   ✅ API test commands
```

### 2. Dependencies đã cài đặt
- ✅ @nestjs/jwt
- ✅ @nestjs/passport
- ✅ passport
- ✅ passport-jwt
- ✅ @types/passport-jwt
- ✅ bcrypt
- ✅ @types/bcrypt

### 3. Configuration Files
- ✅ nest-cli.json - Thêm auth-svc project
- ✅ package.json - Thêm npm scripts
- ✅ docker-compose.yml - Thêm auth service & postgres
- ✅ docker/Dockerfile.auth - Docker build config
- ✅ start-auth.sh - Quick start script

### 4. Database
- ✅ PostgreSQL container riêng cho auth (port 5433)
- ✅ User entity với TypeORM
- ✅ Auto-sync enabled trong dev mode

## 🚀 Cách sử dụng

### Khởi động service:

```bash
# Option 1: Chạy tất cả với Docker
npm run docker:up

# Option 2: Chạy local (cần PostgreSQL)
./start-auth.sh

# Option 3: Chạy development
npm run start:auth

# Option 4: Chạy với native database
npm run start:native:auth
```

### Test API:

```bash
# Register
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123"}'

# Xem thêm trong API-TESTS.md
```

## 🔐 Tính năng

1. **Đăng ký (Register)**
   - Validation với class-validator
   - Hash password với bcrypt
   - Check duplicate username/email
   - Default role: user

2. **Đăng nhập (Login)**
   - Verify password
   - Generate JWT token
   - Return user info (không có password)
   - Token expires: 24h

3. **Xác thực (Validate)**
   - Verify JWT token
   - Return payload (user info)
   - Check expiration

4. **Profile**
   - Protected với JWT Guard
   - Return current user info

5. **Phân quyền (Authorization)**
   - Role-based access control
   - @Roles() decorator
   - RolesGuard implementation
   - Roles: admin, user, guest

## 🔧 Environment Variables

```env
AUTH_SVC_PORT=3003
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5433
AUTH_DB_USERNAME=postgres
AUTH_DB_PASSWORD=postgres
AUTH_DB_NAME=auth_db
JWT_SECRET=my-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | ❌ | Đăng ký user mới |
| POST | /auth/login | ❌ | Đăng nhập |
| POST | /auth/validate | ❌ | Xác thực token |
| GET | /auth/profile | ✅ | Lấy profile |
| GET | /auth/admin-only | ✅ (Admin) | Admin endpoint |

## 🎯 Sử dụng trong services khác

### 1. Import JWT Module
```typescript
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
})
```

### 2. Protect endpoint
```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
getData(@Request() req) {
  // req.user = { id, username, email, roles }
  return { user: req.user };
}
```

### 3. Check roles
```typescript
@Get('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
adminOnly() {
  return { message: 'Admin only' };
}
```

## ✅ Build Test

```bash
npm run build auth-svc
# ✅ webpack 5.100.2 compiled successfully
```

## 📚 Documentation

- `apps/auth-svc/README.md` - Chi tiết về Auth Service
- `apps/auth-svc/API-TESTS.md` - Hướng dẫn test API
- Code comments trong các files

## 🎉 Hoàn thành!

Auth Service đã sẵn sàng sử dụng với đầy đủ tính năng:
- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ Password Hashing
- ✅ Validation
- ✅ TypeORM Integration
- ✅ Docker Support
- ✅ Documentation

Bạn có thể bắt đầu integrate vào API Gateway hoặc các services khác ngay!
