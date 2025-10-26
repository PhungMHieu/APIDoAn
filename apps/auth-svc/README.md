# Auth Service

Service xác thực và phân quyền cho hệ thống My Finance.

## 🔑 Tính năng

- ✅ Đăng ký người dùng (Register)
- ✅ Đăng nhập (Login) với JWT
- ✅ Xác thực token (Validate Token)
- ✅ Phân quyền theo vai trò (Role-based Authorization)
- ✅ Bảo vệ endpoint với JWT Guard
- ✅ Hash mật khẩu với bcrypt

## 🚀 Cách chạy

### 1. Chạy local (Native)

Cần PostgreSQL chạy ở port 5433:

```bash
# Khởi động PostgreSQL cho auth service
docker run -d \
  --name postgres-auth \
  -e POSTGRES_DB=auth_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  postgres:15-alpine

# Chạy auth service
npm run start:native:auth
```

Service sẽ chạy tại: http://localhost:3003

### 2. Chạy với Docker

```bash
# Build và chạy tất cả services
npm run docker:up

# Hoặc chỉ chạy auth service
docker-compose up auth-service postgres-auth-db
```

### 3. Chạy development mode

```bash
npm run start:auth
```

## 📡 API Endpoints

### 1. Đăng ký người dùng

```bash
POST http://localhost:3003/auth/register

Body:
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "roles": ["user"]  // optional, mặc định là ["user"]
}
```

### 2. Đăng nhập

```bash
POST http://localhost:3003/auth/login

Body:
{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "roles": ["user"],
    ...
  }
}
```

### 3. Xác thực token

```bash
POST http://localhost:3003/auth/validate

Body:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Lấy thông tin profile (Protected)

```bash
GET http://localhost:3003/auth/profile

Headers:
Authorization: Bearer <your_jwt_token>
```

### 5. Endpoint chỉ cho Admin (Protected + Role)

```bash
GET http://localhost:3003/auth/admin-only

Headers:
Authorization: Bearer <admin_jwt_token>
```

## 🔐 Sử dụng JWT Guard trong service khác

### Import AuthModule

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
})
export class YourModule {}
```

### Bảo vệ endpoint với JWT Guard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProtectedData() {
    return { message: 'This is protected data' };
  }
}
```

### Bảo vệ endpoint với Role Guard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get()
  @Roles(UserRole.ADMIN)
  getAdminData() {
    return { message: 'This is admin-only data' };
  }
}
```

### Lấy thông tin user từ request

```typescript
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req) {
    // req.user chứa: { id, username, email, roles }
    return req.user;
  }
}
```

## 🔧 Environment Variables

```env
# Auth Service
AUTH_SVC_PORT=3003

# Database
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5433
AUTH_DB_USERNAME=postgres
AUTH_DB_PASSWORD=postgres
AUTH_DB_NAME=auth_db

# JWT
JWT_SECRET=my-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## 🏗️ Cấu trúc thư mục

```
apps/auth-svc/
├── src/
│   ├── auth-svc.controller.ts    # Controller với các endpoints
│   ├── auth-svc.module.ts        # Module chính
│   ├── auth.service.ts           # Service xử lý logic auth
│   ├── main.ts                   # Entry point
│   ├── decorators/
│   │   └── roles.decorator.ts    # Decorator @Roles()
│   ├── dto/
│   │   ├── login.dto.ts          # DTO cho login
│   │   ├── register.dto.ts       # DTO cho register
│   │   └── validate-token.dto.ts # DTO cho validate
│   ├── entities/
│   │   └── user.entity.ts        # User entity với roles
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     # JWT authentication guard
│   │   └── roles.guard.ts        # Role-based authorization guard
│   └── strategies/
│       └── jwt.strategy.ts       # Passport JWT strategy
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
└── tsconfig.app.json
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Vai trò (Roles)

- `admin` - Quản trị viên (full quyền)
- `user` - Người dùng thông thường
- `guest` - Khách (chỉ xem)

## 🔒 Bảo mật

- Mật khẩu được hash với bcrypt (salt rounds: 10)
- JWT token hết hạn sau 24 giờ (có thể cấu hình)
- Sử dụng environment variables cho secrets
- Validation với class-validator
- TypeORM entities với proper types

## 📚 Dependencies

- @nestjs/jwt - JWT token generation
- @nestjs/passport - Passport integration
- passport-jwt - JWT strategy
- bcrypt - Password hashing
- class-validator - DTO validation
- class-transformer - DTO transformation

## 🔄 Integration với API Gateway

Trong API Gateway, bạn có thể proxy requests đến auth service:

```typescript
// api-gateway.controller.ts
@Post('auth/login')
async login(@Body() loginDto: LoginDto) {
  const response = await axios.post(
    `${process.env.AUTH_SERVICE_URL}/auth/login`,
    loginDto
  );
  return response.data;
}
```

Hoặc sử dụng middleware để validate JWT:

```typescript
// jwt.middleware.ts
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/auth/validate`,
        { token }
      );
      req['user'] = response.data;
    }
    next();
  }
}
```

## 🚧 TODO / Improvements

- [ ] Refresh token mechanism
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Rate limiting
- [ ] OAuth2 integration (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging
- [ ] Session management
- [ ] Remember me functionality
- [ ] Account lockout after failed attempts
