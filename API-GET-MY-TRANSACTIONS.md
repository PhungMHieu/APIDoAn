# GET /transactions/my - API Documentation

## Overview
API endpoint để lấy **tất cả transactions với full details** mà user hiện tại đã tạo.

## Endpoint
```
GET /transactions/my
```

## Authentication
**Required**: JWT Bearer Token

```
Authorization: Bearer <your-jwt-token>
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `monthYear` | string | No | Filter by month/year (MM/YYYY) hoặc "future" | `11/2025` hoặc `future` |

## Request Examples

### 1. Get All My Transactions
```bash
curl -X GET "http://localhost:3001/transactions/my" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Get My Transactions for October 2025
```bash
curl -X GET "http://localhost:3001/transactions/my?monthYear=10/2025" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Get My Future Transactions
```bash
curl -X GET "http://localhost:3001/transactions/my?monthYear=future" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Response

### Success Response (200 OK)

**Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "amount": 50000,
      "category": "Food",
      "note": "Lunch with friends",
      "dateTime": "2024-11-01T12:00:00Z",
      "createdAt": "2024-11-01T10:00:00Z",
      "updatedAt": "2024-11-01T10:05:00Z"
    },
    {
      "id": "uuid-here-2",
      "amount": 120000,
      "category": "Shopping",
      "note": "Buy groceries",
      "dateTime": "2024-11-05T15:30:00Z",
      "createdAt": "2024-11-05T14:00:00Z",
      "updatedAt": "2024-11-05T14:00:00Z"
    }
  ]
}
```

**Empty Result:**
```json
{
  "success": true,
  "data": []
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "statusCode": 401
  }
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Failed to fetch user transactions: <error details>",
    "statusCode": 400
  }
}
```

## How It Works

### 1. Authentication
- Extracts user ID from JWT token
- User không cần truyền userId trong request

### 2. Query Process
```sql
-- Step 1: Tìm transactions user đã tạo
SELECT transactionId 
FROM user_transactions 
WHERE userId = '<user-id-from-jwt>' 
  AND action = 'CREATE';

-- Step 2: Lấy full details
SELECT * 
FROM transactions 
WHERE id IN (list-of-transaction-ids)
ORDER BY dateTime DESC;
```

### 3. Filtering
- **No filter**: Trả về tất cả transactions của user
- **monthYear=MM/YYYY**: Chỉ transactions trong tháng đó
- **monthYear=future**: Chỉ transactions từ ngày mai trở đi

## Comparison with Other APIs

| API | Return Data | Use Case |
|-----|-------------|----------|
| `GET /transactions/my` | ✅ Full details | Display to user |
| `GET /transactions/my/ids` | ❌ IDs only | Check ownership |
| `GET /transactions` | ✅ Full details | All transactions (admin) |
| `GET /transactions/:id` | ✅ Full details (1) | Specific transaction |

## Performance

### Optimization
- ✅ Single database query với JOIN
- ✅ Indexed on `userId` column
- ✅ Indexed on `transactionId` column
- ✅ Efficient IN clause

### Expected Response Time
- **< 100ms**: For users with < 100 transactions
- **< 500ms**: For users with < 1000 transactions
- **> 500ms**: Consider pagination for users with > 1000 transactions

## Security

### Access Control
- ✅ JWT required
- ✅ User can ONLY see their own transactions
- ✅ Cannot access other users' data

### Data Privacy
- Transaction details are private to the creator
- Only transactions with `action='CREATE'` are returned

## Frontend Integration

### React Example
```typescript
import axios from 'axios';

const getMyTransactions = async (monthYear?: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    const url = monthYear 
      ? `/transactions/my?monthYear=${monthYear}`
      : '/transactions/my';
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.data; // Array of transactions
  } catch (error) {
    console.error('Error fetching my transactions:', error);
    throw error;
  }
};

// Usage
const myTransactions = await getMyTransactions();
const octoberTransactions = await getMyTransactions('10/2025');
const futureTransactions = await getMyTransactions('future');
```

### Angular Example
```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export class TransactionService {
  constructor(private http: HttpClient) {}
  
  getMyTransactions(monthYear?: string): Observable<Transaction[]> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    
    const params = monthYear ? { monthYear } : {};
    
    return this.http.get<Transaction[]>('/transactions/my', {
      headers,
      params
    });
  }
}
```

## Testing

### Manual Test
```bash
# 1. Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Create some transactions
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":50000,"category":"Food"}'

# 3. Get my transactions
curl -X GET http://localhost:3001/transactions/my \
  -H "Authorization: Bearer $TOKEN"
```

### Automated Test
```bash
./test-transaction-user.sh
```

## Best Practices

### ✅ DO
- Always include JWT token
- Handle empty results gracefully
- Use monthYear filter to reduce data load
- Cache results when appropriate
- Show loading state while fetching

### ❌ DON'T
- Don't fetch all transactions if only IDs needed (use `/my/ids`)
- Don't store sensitive data in localStorage without encryption
- Don't make repeated calls - cache the data
- Don't forget to handle 401 errors (redirect to login)

## Future Enhancements

Possible improvements:
- [ ] Pagination support (`?page=1&limit=20`)
- [ ] Sorting options (`?sortBy=amount&order=desc`)
- [ ] Category filter (`?category=Food`)
- [ ] Date range filter (`?from=2025-01-01&to=2025-12-31`)
- [ ] Include statistics (total, average, count)
- [ ] Export to CSV/PDF

## Related APIs

- **POST** `/transactions` - Create new transaction
- **PUT** `/transactions/:id` - Update transaction
- **DELETE** `/transactions/:id` - Delete transaction
- **GET** `/transactions/my/ids` - Get transaction IDs only
- **GET** `/transactions` - Get all transactions (no filter)
- **GET** `/transactions/:id` - Get specific transaction

---

**Last Updated:** November 1, 2025  
**API Version:** 1.0  
**Status:** ✅ Production Ready
