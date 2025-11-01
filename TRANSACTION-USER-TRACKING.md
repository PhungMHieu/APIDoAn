# Transaction Service - User Tracking Feature

## Overview
Transaction Service đã được cập nhật với tính năng theo dõi người dùng (User Tracking), cho phép:
- Ghi lại user nào tạo transaction
- Kiểm tra quyền sở hữu khi update/delete
- Lưu lịch sử các thao tác của user

## Database Schema

### User Transactions Table
```sql
CREATE TABLE user_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    created_at TIMESTAMP NOT NULL,
    UNIQUE(user_id, transaction_id)
);
```

## API Endpoints

### 1. Create Transaction (Protected)
**POST** `/transactions`

Tạo transaction mới và ghi nhận user là người tạo.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "amount": 50000,
  "category": "Food",
  "note": "Lunch with friends",
  "dateTime": "2024-11-01T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "amount": 50000,
    "category": "Food",
    "note": "Lunch with friends",
    "dateTime": "2024-11-01T12:00:00Z",
    "createdAt": "2024-11-01T10:00:00Z",
    "updatedAt": "2024-11-01T10:00:00Z"
  }
}
```

### 2. Update Transaction (Protected)
**PUT** `/transactions/:id`

Chỉ user tạo transaction mới có thể update.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "amount": 75000,
  "note": "Updated note"
}
```

**Response:**
- `200 OK`: Update thành công
- `403 Forbidden`: User không có quyền update transaction này
- `404 Not Found`: Transaction không tồn tại

### 3. Delete Transaction (Protected)
**DELETE** `/transactions/:id`

Chỉ user tạo transaction mới có thể delete.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- `200 OK`: Delete thành công
- `403 Forbidden`: User không có quyền delete transaction này
- `404 Not Found`: Transaction không tồn tại

### 4. Get My Transaction IDs (Protected)
**GET** `/transactions/my/ids?monthYear=MM/YYYY`

Lấy danh sách ID của các transaction mà user đã tạo.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `monthYear` (optional): Filter theo tháng (MM/YYYY) hoặc "future"

**Response:**
```json
{
  "success": true,
  "data": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}
```

### 5. Get All Transactions (Protected)
**GET** `/transactions?monthYear=MM/YYYY`

Lấy tất cả transactions (không filter theo user).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

### 6. Get Transaction by ID (Protected)
**GET** `/transactions/:id`

Lấy chi tiết một transaction (không filter theo user).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

## Service Methods

### createWithUser(userId, transactionData)
Tạo transaction và ghi nhận user ownership.

### updateWithUser(id, userId, transactionData)
Update transaction với kiểm tra quyền sở hữu.

### deleteWithUser(id, userId)
Delete transaction với kiểm tra quyền sở hữu.

### getUserTransactionIds(userId, monthYear?)
Lấy danh sách transaction IDs của user.

## User Tracking Actions

- **CREATE**: User tạo transaction mới
- **UPDATE**: User update transaction (phải là owner)
- **DELETE**: User delete transaction (phải là owner)

## Testing

Chạy script test tự động:
```bash
./test-transaction-user.sh
```

Script sẽ test các scenarios:
1. Register và login user
2. Tạo transaction
3. Lấy danh sách transaction IDs của user
4. Update transaction
5. Tạo user thứ 2 và test quyền (nên fail)
6. Delete transaction với user đúng

## Security Features

1. **JWT Authentication**: Tất cả endpoints đều yêu cầu JWT token
2. **Ownership Verification**: Chỉ owner mới có thể update/delete
3. **Action Tracking**: Mọi thao tác đều được ghi lại
4. **Database Constraints**: Unique constraint để tránh duplicate tracking

## Migration

Để cập nhật database schema:

### Docker Environment
```bash
# Restart postgres container để chạy migration script
docker-compose down postgres-db
docker-compose up -d postgres-db
```

### Native Environment
```bash
# Run migration script
psql -U postgres -d transaction_db -f docker/init-scripts/postgres-transaction-update.sql
```

## Error Responses

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to update this transaction",
    "statusCode": 403
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Transaction with ID xxx not found",
    "statusCode": 404
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "statusCode": 401
  }
}
```

## Implementation Details

### Entity
- `UserTransactionEntity`: Tracks user-transaction relationships
- Foreign keys: `userId`, `transactionId`
- Indexed for performance

### Service Layer
- Separation of concerns: public methods vs user-protected methods
- Proper error handling with specific exceptions
- Transaction history tracking

### Controller Layer
- JWT authentication on all endpoints
- User data extracted from JWT token
- Swagger documentation with security schemes

## Best Practices

1. **Always use JWT**: Đảm bảo client luôn gửi valid JWT token
2. **Handle errors**: Client nên xử lý 403 Forbidden khi user không có quyền
3. **Track history**: Có thể query user_transactions để xem lịch sử
4. **Performance**: Indexes đã được tạo cho query optimization

## Future Enhancements

Các tính năng có thể thêm trong tương lai:
- Sharing transactions giữa users
- Admin role có thể quản lý tất cả transactions
- Audit log chi tiết hơn
- Soft delete với restore functionality
- Transaction categories per user
