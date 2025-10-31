# Email-Based Authentication Update

## 📝 Tổng quan

Auth service đã được cập nhật để sử dụng **email** thay vì **username** cho đăng nhập, và loại bỏ trường `roles` khỏi form đăng ký để đơn giản hóa user experience.

## 🔄 Các thay đổi chính

### 1. Login với Email

**Trước đây:**
```json
{
  "username": "testuser",
  "password": "Test123456"
}
```

**Bây giờ:**
```json
{
  "email": "test@example.com",
  "password": "Test123456"
}
```

### 2. Registration không cần Roles

**Trước đây:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456",
  "roles": ["user"]  // Optional field
}
```

**Bây giờ:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456"
}
```

- Trường `roles` đã bị loại bỏ hoàn toàn
- Mọi user mới tự động nhận role **USER** mặc định
- Admin có thể thay đổi roles sau thông qua admin panel

## 💻 Chi tiết kỹ thuật

### LoginDto Changes

**File:** `apps/auth-svc/src/dto/login.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
```

**Thay đổi:**
- ✅ Đổi field `username` thành `email`
- ✅ Thêm validation `@IsEmail()` để đảm bảo format đúng
- ✅ Update Swagger documentation

### RegisterDto Changes

**File:** `apps/auth-svc/src/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
```

**Thay đổi:**
- ❌ Xóa field `roles?: UserRole[]`
- ❌ Xóa import `UserRole` enum
- ✅ Giữ lại username, email, password

### AuthService Logic Changes

**File:** `apps/auth-svc/src/auth.service.ts`

#### Register Method

```typescript
async register(registerDto: RegisterDto): Promise<{ message: string; user: Partial<User> }> {
  const { username, email, password } = registerDto;

  // Check if user already exists
  const existingUser = await this.userRepository.findOne({
    where: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ConflictException('Username or email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user with default USER role
  const user = this.userRepository.create({
    username,
    email,
    password: hashedPassword,
    roles: [UserRole.USER], // Always assign USER role by default
  });

  await this.userRepository.save(user);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    message: 'User registered successfully',
    user: userWithoutPassword,
  };
}
```

**Thay đổi:**
- ✅ Không còn extract `roles` từ registerDto
- ✅ Luôn gán `roles: [UserRole.USER]` mặc định
- ✅ Comment giải thích rõ ràng

#### Login Method

```typescript
async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
  const { email, password } = loginDto;

  // Find user by email
  const user = await this.userRepository.findOne({ where: { email } });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedException('User account is disabled');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Generate JWT token
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  };

  const access_token = this.jwtService.sign(payload);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    access_token,
    user: userWithoutPassword,
  };
}
```

**Thay đổi:**
- ✅ Extract `email` thay vì `username` từ loginDto
- ✅ Tìm user bằng `{ where: { email } }` thay vì `{ where: { username } }`
- ✅ Comment rõ ràng "Find user by email"

### Controller Swagger Updates

**File:** `apps/auth-svc/src/auth-svc.controller.ts`

```typescript
@Post('register')
@ApiOperation({ 
  summary: 'Register a new user',
  description: 'Creates a new user account with automatic USER role assignment. Username and email must be unique.'
})
@ApiBody({
  type: RegisterDto,
  examples: {
    user: {
      summary: 'Standard user registration',
      value: {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'SecurePassword123',
      },
    },
  },
})
@ApiResponse({
  status: 201,
  description: 'User successfully registered with USER role',
  schema: {
    example: {
      message: 'User registered successfully',
      user: {
        id: 'uuid-string',
        username: 'john_doe',
        email: 'john@example.com',
        roles: ['user'],
        isActive: true,
        createdAt: '2025-10-31T00:00:00.000Z',
        updatedAt: '2025-10-31T00:00:00.000Z',
      },
    },
  },
})

@Post('login')
@ApiOperation({ 
  summary: 'User login',
  description: 'Authenticate user with email and password. Returns JWT access token.'
})
@ApiBody({
  type: LoginDto,
  examples: {
    standardUser: {
      summary: 'Login with email',
      value: {
        email: 'john@example.com',
        password: 'SecurePassword123',
      },
    },
  },
})
```

**Thay đổi:**
- ✅ Register examples không còn field `roles`
- ✅ Response examples hiển thị `roles: ['user']` tự động
- ✅ Login examples sử dụng `email` thay vì `username`
- ✅ Description rõ ràng về email-based authentication

## 🧪 Testing

### 1. Đăng ký user mới

```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "username": "testuser",
    "email": "test@example.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2025-10-31T00:07:02.275Z",
    "updatedAt": "2025-10-31T00:07:02.275Z"
  }
}
```

### 2. Login với email

```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "username": "testuser",
    "email": "test@example.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2025-10-31T00:07:02.275Z",
    "updatedAt": "2025-10-31T00:07:02.275Z"
  }
}
```

### 3. Sử dụng JWT token

```bash
curl -X GET http://localhost:3001/transactions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Retrieved 0 record(s) successfully",
  "timestamp": "2025-10-31T00:07:44.852Z",
  "path": "/transactions",
  "data": []
}
```

## ✅ Verification Checklist

- [x] LoginDto sử dụng email field với @IsEmail validation
- [x] RegisterDto không còn roles field
- [x] AuthService.register() luôn gán USER role mặc định
- [x] AuthService.login() tìm user bằng email
- [x] Swagger documentation updated với examples mới
- [x] Docker image rebuilt và deployed
- [x] Registration tested - tự động nhận USER role
- [x] Login tested - hoạt động với email
- [x] JWT token tested - hoạt động với protected endpoints

## 🔐 Security Notes

### Email Validation
- Email được validate ở cả DTO layer và database constraint
- Format email phải hợp lệ theo RFC 5322 standard
- Email phải unique trong database

### Default Role Assignment
- Mọi user mới đều nhận role **USER** mặc định
- Admin roles chỉ có thể được gán bởi existing admins
- Không thể tự register với admin role (security best practice)

### Password Security
- Minimum 6 characters
- Hashed với bcrypt (10 salt rounds)
- Password không bao giờ được return trong response

## 📊 Database Schema

User entity không thay đổi, vẫn giữ nguyên cấu trúc:

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('simple-array', { default: 'user' })
  roles: UserRole[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 🚀 Deployment

Để apply các thay đổi:

```bash
# Rebuild và restart tất cả services
./deploy-auth.sh

# Hoặc manual:
docker compose build auth-service
docker compose up -d auth-service
```

## 📚 API Documentation

Xem Swagger UI để testing:
- Auth Service: http://localhost:3003/api
- Có thể test trực tiếp register và login từ Swagger interface

## 🔄 Migration Guide

Nếu có existing code sử dụng username-based login:

### Frontend Changes Required

**Old Login Form:**
```javascript
const loginData = {
  username: formData.username,
  password: formData.password
};
```

**New Login Form:**
```javascript
const loginData = {
  email: formData.email,  // Changed from username
  password: formData.password
};
```

**Old Registration Form:**
```javascript
const registerData = {
  username: formData.username,
  email: formData.email,
  password: formData.password,
  roles: ['user']  // Remove this
};
```

**New Registration Form:**
```javascript
const registerData = {
  username: formData.username,
  email: formData.email,
  password: formData.password
  // roles removed
};
```

## ❓ FAQ

**Q: Có thể vẫn dùng username để login không?**
A: Không, hiện tại chỉ hỗ trợ email-based login. Nếu cần username login, có thể thêm endpoint riêng hoặc support cả 2 methods.

**Q: Làm sao để tạo admin user?**
A: Admin users cần được tạo thông qua database migration hoặc bởi existing admin. Không thể tự register làm admin.

**Q: Email có case-sensitive không?**
A: Email được validate theo standard RFC, thường không case-sensitive nhưng nên lưu lowercase để consistency.

**Q: Có thể đổi email sau khi đăng ký không?**
A: Hiện tại chưa có API endpoint để update email. Cần implement endpoint riêng cho profile update.

## 📅 Update History

- **2025-10-31**: Initial email-based authentication implementation
  - Changed login from username to email
  - Removed roles field from registration
  - Updated Swagger documentation
  - Deployed to Docker containers

---

**Author:** Auth Service Team  
**Last Updated:** October 31, 2025  
**Version:** 1.0.0
