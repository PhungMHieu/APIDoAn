# Auth Service API Test

Các lệnh để test Auth Service API.

## 1. Đăng ký người dùng mới

```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 2. Đăng ký Admin

```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "roles": ["admin"]
  }'
```

## 3. Đăng nhập

```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Response:**
```json
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

**Lưu token để sử dụng cho các request sau:**
```bash
export TOKEN="your_access_token_here"
```

## 4. Xác thực token

```bash
curl -X POST http://localhost:3003/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'"$TOKEN"'"
  }'
```

## 5. Lấy thông tin profile (Protected)

```bash
curl -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Test endpoint Admin-only

### Với user thường (sẽ fail):
```bash
curl -X GET http://localhost:3003/auth/admin-only \
  -H "Authorization: Bearer $TOKEN"
```

### Với admin (sẽ success):
```bash
# Đăng nhập với admin
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Lưu admin token
export ADMIN_TOKEN="admin_access_token_here"

# Test admin endpoint
curl -X GET http://localhost:3003/auth/admin-only \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Test với HTTPie (nếu cài đặt)

```bash
# Install HTTPie
brew install httpie

# Register
http POST localhost:3003/auth/register username=testuser email=test@example.com password=password123

# Login
http POST localhost:3003/auth/login username=testuser password=password123

# Get profile with token
http GET localhost:3003/auth/profile Authorization:"Bearer $TOKEN"
```

## Test với VS Code REST Client Extension

Tạo file `test.http`:

```http
### Register User
POST http://localhost:3003/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

### Login
POST http://localhost:3003/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

### Get Profile (Replace TOKEN)
GET http://localhost:3003/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE

### Validate Token
POST http://localhost:3003/auth/validate
Content-Type: application/json

{
  "token": "YOUR_TOKEN_HERE"
}
```

## Expected Errors

### 1. Duplicate username/email
```json
{
  "statusCode": 409,
  "message": "Username or email already exists"
}
```

### 2. Invalid credentials
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### 3. Missing token
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 4. Insufficient permissions
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```
