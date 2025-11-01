# 🔌 gRPC Architecture & Service Communication

## 📋 Mục Lục
- [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
- [gRPC vs REST](#grpc-vs-rest)
- [Luồng Xác Thực với Auth Service](#luồng-xác-thực-với-auth-service)
- [Luồng Transaction với User Tracking](#luồng-transaction-với-user-tracking)
- [Protocol Buffers Definition](#protocol-buffers-definition)
- [Implementation Details](#implementation-details)

---

## 🏗️ Tổng Quan Kiến Trúc

### Sơ Đồ Tổng Thể

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT                                       │
│                           (Browser / Mobile App / Postman)                      │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │ HTTP/REST
                                     │ (Authorization: Bearer JWT)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                        │
│                           Port: 3000 (External)                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │            Transaction Aggregator Module                                │   │
│  │  - Receives HTTP requests from clients                                  │   │
│  │  - Extracts JWT token and validates                                     │   │
│  │  - Converts HTTP → gRPC                                                 │   │
│  │  - Aggregates data from multiple services                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└───────┬──────────────────────────────────────────────┬──────────────────────────┘
        │                                              │
        │ gRPC (Proto)                                 │ gRPC (Proto)
        │ Port: 50051                                  │ Port: 50052
        │                                              │
        ▼                                              ▼
┌──────────────────────────────┐           ┌──────────────────────────────┐
│   TRANSACTION SERVICE        │           │      AUTH SERVICE            │
│   Port: 3001 (HTTP)          │           │   Port: 3003 (HTTP)          │
│   Port: 50051 (gRPC)         │◄──────────│   Port: 50052 (gRPC)         │
│                              │  Validate │                              │
│  ┌────────────────────────┐  │   User    │  ┌────────────────────────┐  │
│  │  REST Controller       │  │           │  │  REST Controller       │  │
│  │  - HTTP Endpoints      │  │           │  │  - Register            │  │
│  │  - JWT Protected       │  │           │  │  - Login               │  │
│  └────────────────────────┘  │           │  │  - Validate Token      │  │
│                              │           │  └────────────────────────┘  │
│  ┌────────────────────────┐  │           │                              │
│  │  gRPC Controller       │  │           │  ┌────────────────────────┐  │
│  │  - Proto Interface     │  │           │  │  User Repository       │  │
│  │  - Stream Support      │  │           │  │  - PostgreSQL          │  │
│  └────────────────────────┘  │           │  │  - JWT Generation      │  │
│                              │           │  └────────────────────────┘  │
│  ┌────────────────────────┐  │           │                              │
│  │  Service Layer         │  │           └──────────────────────────────┘
│  │  - Business Logic      │  │
│  │  - User Tracking       │  │
│  │  - Authorization       │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  Database Layer        │  │
│  │  - Transactions        │  │
│  │  - User_Transactions   │  │
│  │  (PostgreSQL)          │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

---

## 🔄 gRPC vs REST

### So Sánh

| Tính Năng | REST API | gRPC |
|-----------|----------|------|
| **Protocol** | HTTP/1.1 | HTTP/2 |
| **Format** | JSON/XML | Protocol Buffers (Binary) |
| **Performance** | 🐢 Slow | ⚡ Fast (3-10x) |
| **Size** | 📦 Large | 📦 Small (50% smaller) |
| **Streaming** | ❌ Limited | ✅ Bi-directional |
| **Type Safety** | ❌ Runtime | ✅ Compile-time |
| **Browser Support** | ✅ Native | ⚠️ Requires Proxy |
| **Human Readable** | ✅ Yes | ❌ Binary |
| **Use Case** | Client-facing | Service-to-Service |

### Khi Nào Dùng Gì?

**REST (HTTP):**
- ✅ Client → API Gateway (browsers, mobile apps)
- ✅ External public APIs
- ✅ Debugging và development

**gRPC:**
- ✅ Service-to-Service communication (internal)
- ✅ High-performance requirements
- ✅ Streaming data
- ✅ Microservices architecture

---

## 🔐 Luồng Xác Thực với Auth Service

### Sơ Đồ Chi Tiết

```
┌──────────┐                    ┌─────────────┐                  ┌──────────────┐
│  CLIENT  │                    │ API GATEWAY │                  │ AUTH SERVICE │
└────┬─────┘                    └──────┬──────┘                  └──────┬───────┘
     │                                 │                                │
     │  1. POST /auth/register         │                                │
     │  {email, password, username}    │                                │
     ├────────────────────────────────►│                                │
     │                                 │                                │
     │                                 │  2. Forward to Auth Service    │
     │                                 │     (HTTP or gRPC)             │
     │                                 ├───────────────────────────────►│
     │                                 │                                │
     │                                 │                                │  3. Hash password
     │                                 │                                │     with bcrypt
     │                                 │                                │
     │                                 │                                │  4. Save to DB
     │                                 │                                │     (PostgreSQL)
     │                                 │                                │
     │                                 │  5. Return user data           │
     │                                 │◄───────────────────────────────┤
     │                                 │     {id, email, roles}         │
     │                                 │                                │
     │  6. Registration success        │                                │
     │◄────────────────────────────────┤                                │
     │     {user, message}             │                                │
     │                                 │                                │
     │                                 │                                │
     │  7. POST /auth/login            │                                │
     │  {email, password}              │                                │
     ├────────────────────────────────►│                                │
     │                                 │                                │
     │                                 │  8. Forward credentials        │
     │                                 ├───────────────────────────────►│
     │                                 │                                │
     │                                 │                                │  9. Find user by email
     │                                 │                                │
     │                                 │                                │  10. Verify password
     │                                 │                                │      bcrypt.compare()
     │                                 │                                │
     │                                 │                                │  11. Generate JWT
     │                                 │                                │      - sub: userId
     │                                 │                                │      - email: email
     │                                 │                                │      - roles: [...]
     │                                 │                                │
     │                                 │  12. Return JWT token          │
     │                                 │◄───────────────────────────────┤
     │                                 │      {access_token, user}      │
     │                                 │                                │
     │  13. Login success              │                                │
     │◄────────────────────────────────┤                                │
     │     {access_token, user}        │                                │
     │                                 │                                │
     │                                 │                                │
     │  14. Subsequent requests        │                                │
     │  Authorization: Bearer <JWT>    │                                │
     ├────────────────────────────────►│                                │
     │                                 │                                │
     │                                 │  15. Validate JWT              │
     │                                 │      (JwtAuthGuard)            │
     │                                 │      - Verify signature        │
     │                                 │      - Check expiration        │
     │                                 │      - Extract user data       │
     │                                 │                                │
     │  16. Process request            │                                │
     │     with authenticated user     │                                │
     │                                 │                                │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "a9220fdc-5f97-4583-b119-16493956e375",  // userId (NEVER CHANGES)
    "username": "testuser",
    "email": "testuser@example.com",
    "roles": ["user"],
    "iat": 1761974475,  // Issued At
    "exp": 1762060875   // Expiry
  },
  "signature": "FHnTML_YMYyDwgh66Qaa2_IAa5K51rugFyDR3nCewo8"
}
```

**Lưu ý quan trọng:**
- ✅ `sub` (userId) **LUÔN GIỐNG NHAU** cho cùng một user
- ✅ Mỗi lần login tạo token mới nhưng userId không đổi
- ✅ Token hết hạn sau 24h (configurable)

---

## 💰 Luồng Transaction với User Tracking

### Sơ Đồ Luồng Create Transaction

```
┌──────────┐              ┌─────────────┐              ┌───────────────────┐
│  CLIENT  │              │ API GATEWAY │              │ TRANSACTION SVC   │
└────┬─────┘              └──────┬──────┘              └─────────┬─────────┘
     │                           │                               │
     │ 1. POST /transactions     │                               │
     │    Authorization:         │                               │
     │    Bearer <JWT>           │                               │
     │    Body: {                │                               │
     │      amount: 50000,       │                               │
     │      category: "Food"     │                               │
     │    }                      │                               │
     ├──────────────────────────►│                               │
     │                           │                               │
     │                           │ 2. Extract JWT token          │
     │                           │    Decode & validate          │
     │                           │    Extract userId from        │
     │                           │    payload.sub                │
     │                           │                               │
     │                           │ 3. gRPC Call:                 │
     │                           │    CreateUserTransaction()    │
     │                           │    {                          │
     │                           │      userId: "abc-123",       │
     │                           │      amount: 50000,           │
     │                           │      category: "Food"         │
     │                           │    }                          │
     │                           ├──────────────────────────────►│
     │                           │                               │
     │                           │                               │ 4. Service Layer
     │                           │                               │    createWithUser()
     │                           │                               │
     │                           │                               │ 5. Start Transaction
     │                           │                               │
     │                           │                               │ 6. INSERT INTO transactions
     │                           │                               │    (amount, category, ...)
     │                           │                               │    ┌──────────────────┐
     │                           │                               │───►│ Transactions DB  │
     │                           │                               │    │ id: trans-001    │
     │                           │                               │◄───│ amount: 50000    │
     │                           │                               │    └──────────────────┘
     │                           │                               │
     │                           │                               │ 7. INSERT INTO user_transactions
     │                           │                               │    (userId, transactionId, action)
     │                           │                               │    ┌──────────────────────┐
     │                           │                               │───►│ User_Transactions DB │
     │                           │                               │    │ userId: abc-123      │
     │                           │                               │◄───│ transactionId: trans-001
     │                           │                               │    │ action: CREATE       │
     │                           │                               │    └──────────────────────┘
     │                           │                               │
     │                           │                               │ 8. Commit Transaction
     │                           │                               │
     │                           │ 9. gRPC Response:             │
     │                           │    Transaction details        │
     │                           │◄──────────────────────────────┤
     │                           │                               │
     │ 10. HTTP Response         │                               │
     │     201 Created           │                               │
     │     {                     │                               │
     │       id: "trans-001",    │                               │
     │       amount: 50000,      │                               │
     │       category: "Food"    │                               │
     │     }                     │                               │
     │◄──────────────────────────┤                               │
     │                           │                               │
```

### Sơ Đồ Luồng Get My Transactions

```
┌──────────┐              ┌─────────────┐              ┌───────────────────┐
│  CLIENT  │              │ API GATEWAY │              │ TRANSACTION SVC   │
└────┬─────┘              └──────┬──────┘              └─────────┬─────────┘
     │                           │                               │
     │ 1. GET /transactions      │                               │
     │    Authorization:         │                               │
     │    Bearer <JWT>           │                               │
     ├──────────────────────────►│                               │
     │                           │                               │
     │                           │ 2. Validate JWT               │
     │                           │    Extract userId: "abc-123"  │
     │                           │                               │
     │                           │ 3. gRPC/HTTP Call:            │
     │                           │    GetUserTransactions()      │
     │                           │    userId: "abc-123"          │
     │                           ├──────────────────────────────►│
     │                           │                               │
     │                           │                               │ 4. Query Database
     │                           │                               │
     │                           │                               │ 5. SELECT transactionId
     │                           │                               │    FROM user_transactions
     │                           │                               │    WHERE userId = 'abc-123'
     │                           │                               │    AND action = 'CREATE'
     │                           │                               │    ┌──────────────────────┐
     │                           │                               │───►│ User_Transactions DB │
     │                           │                               │    │ Returns: [trans-001, │
     │                           │                               │◄───│          trans-002]  │
     │                           │                               │    └──────────────────────┘
     │                           │                               │
     │                           │                               │ 6. SELECT * FROM transactions
     │                           │                               │    WHERE id IN ('trans-001', 'trans-002')
     │                           │                               │    ┌──────────────────┐
     │                           │                               │───►│ Transactions DB  │
     │                           │                               │    │ Returns full     │
     │                           │                               │◄───│ transaction data │
     │                           │                               │    └──────────────────┘
     │                           │                               │
     │                           │ 7. gRPC Response:             │
     │                           │    Array of transactions      │
     │                           │◄──────────────────────────────┤
     │                           │                               │
     │ 8. HTTP Response          │                               │
     │    200 OK                 │                               │
     │    [                      │                               │
     │      {id: "trans-001",...}│                               │
     │      {id: "trans-002",...}│                               │
     │    ]                      │                               │
     │◄──────────────────────────┤                               │
     │                           │                               │
```

### Sơ Đồ Luồng Update Transaction (với Authorization)

```
┌──────────┐              ┌─────────────┐              ┌───────────────────┐
│  CLIENT  │              │ API GATEWAY │              │ TRANSACTION SVC   │
│ User B   │              └──────┬──────┘              └─────────┬─────────┘
└────┬─────┘                     │                               │
     │                           │                               │
     │ 1. PUT /transactions/     │                               │
     │        trans-001          │                               │
     │    Authorization:         │                               │
     │    Bearer <JWT_UserB>     │                               │
     │    Body: {                │                               │
     │      amount: 100000       │                               │
     │    }                      │                               │
     ├──────────────────────────►│                               │
     │                           │                               │
     │                           │ 2. Validate JWT               │
     │                           │    Extract userId: "user-B"   │
     │                           │                               │
     │                           │ 3. gRPC Call:                 │
     │                           │    UpdateUserTransaction()    │
     │                           │    {                          │
     │                           │      transactionId: "trans-001"
     │                           │      userId: "user-B",        │
     │                           │      data: {amount: 100000}   │
     │                           │    }                          │
     │                           ├──────────────────────────────►│
     │                           │                               │
     │                           │                               │ 4. CHECK OWNERSHIP
     │                           │                               │    SELECT * FROM user_transactions
     │                           │                               │    WHERE transactionId = 'trans-001'
     │                           │                               │    AND userId = 'user-B'
     │                           │                               │    AND action = 'CREATE'
     │                           │                               │    ┌──────────────────────┐
     │                           │                               │───►│ User_Transactions DB │
     │                           │                               │    │ Result: NULL         │
     │                           │                               │◄───│ (User B is NOT owner)│
     │                           │                               │    └──────────────────────┘
     │                           │                               │
     │                           │                               │ 5. Throw ForbiddenException
     │                           │                               │    "You do not have permission"
     │                           │                               │
     │                           │ 6. gRPC Error Response:       │
     │                           │    403 Forbidden              │
     │                           │◄──────────────────────────────┤
     │                           │                               │
     │ 7. HTTP Response          │                               │
     │    403 Forbidden          │                               │
     │    {                      │                               │
     │      message: "You do not │                               │
     │      have permission..."  │                               │
     │    }                      │                               │
     │◄──────────────────────────┤                               │
     │                           │                               │
```

**Nếu User A (owner) update:**

```
4. CHECK OWNERSHIP
   SELECT * FROM user_transactions
   WHERE transactionId = 'trans-001'
   AND userId = 'user-A'
   AND action = 'CREATE'
   ┌──────────────────────┐
   │ User_Transactions DB │
   │ Result: FOUND ✅     │ ← User A IS owner
   └──────────────────────┘

5. UPDATE transactions
   SET amount = 100000
   WHERE id = 'trans-001'

6. INSERT INTO user_transactions
   (userId, transactionId, action)
   VALUES ('user-A', 'trans-001', 'UPDATE')  ← Log the action

7. Return success
```

---

## 📝 Protocol Buffers Definition

### transaction.proto

```protobuf
syntax = "proto3";

package transaction;

// Transaction Service Definition
service TransactionService {
  // Get transaction by ID
  rpc GetTransaction(GetTransactionRequest) returns (TransactionResponse);
  
  // Get transactions by user ID
  rpc GetUserTransactions(GetUserTransactionsRequest) returns (TransactionListResponse);
  
  // Create transaction with user tracking
  rpc CreateUserTransaction(CreateUserTransactionRequest) returns (TransactionResponse);
  
  // Update transaction with ownership check
  rpc UpdateUserTransaction(UpdateUserTransactionRequest) returns (TransactionResponse);
  
  // Delete transaction with ownership check
  rpc DeleteUserTransaction(DeleteUserTransactionRequest) returns (DeleteResponse);
  
  // Stream transactions (bi-directional streaming)
  rpc StreamTransactions(stream TransactionStreamRequest) returns (stream TransactionResponse);
}

// Messages
message Transaction {
  string id = 1;
  double amount = 2;
  string category = 3;
  string note = 4;
  string dateTime = 5;
  string createdAt = 6;
  string updatedAt = 7;
}

message GetTransactionRequest {
  string id = 1;
}

message GetUserTransactionsRequest {
  string userId = 1;
  optional string monthYear = 2;
}

message CreateUserTransactionRequest {
  string userId = 1;
  double amount = 2;
  string category = 3;
  optional string note = 4;
  optional string dateTime = 5;
}

message UpdateUserTransactionRequest {
  string id = 1;
  string userId = 2;
  optional double amount = 3;
  optional string category = 4;
  optional string note = 5;
}

message DeleteUserTransactionRequest {
  string id = 1;
  string userId = 2;
}

message TransactionResponse {
  bool success = 1;
  string message = 2;
  Transaction data = 3;
}

message TransactionListResponse {
  bool success = 1;
  string message = 2;
  repeated Transaction data = 3;
  int32 count = 4;
}

message DeleteResponse {
  bool success = 1;
  string message = 2;
}

message TransactionStreamRequest {
  string userId = 1;
  optional string filter = 2;
}
```

---

## 💻 Implementation Details

### 1. Transaction Service - gRPC Controller

```typescript
// apps/transaction-svc/src/transaction-grpc.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class TransactionGrpcController {
  constructor(private readonly service: TransactionSvcService) {}

  @GrpcMethod('TransactionService', 'CreateUserTransaction')
  async createUserTransaction(data: CreateUserTransactionDto) {
    const transaction = await this.service.createWithUser(
      data.userId,
      {
        amount: data.amount,
        category: data.category,
        note: data.note,
        dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
      }
    );

    return {
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    };
  }

  @GrpcMethod('TransactionService', 'GetUserTransactions')
  async getUserTransactions(data: GetUserTransactionsDto) {
    const transactions = await this.service.getTransactionsByUser(
      data.userId,
      data.monthYear,
    );

    return {
      success: true,
      message: `Retrieved ${transactions.length} transactions`,
      data: transactions,
      count: transactions.length,
    };
  }

  @GrpcMethod('TransactionService', 'UpdateUserTransaction')
  async updateUserTransaction(data: UpdateUserTransactionDto) {
    const transaction = await this.service.updateWithUser(
      data.id,
      data.userId,
      {
        amount: data.amount,
        category: data.category,
        note: data.note,
      }
    );

    return {
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    };
  }
}
```

### 2. API Gateway - gRPC Client Setup

```typescript
// apps/api-gateway/src/transaction-aggregator/transaction-aggregator.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRANSACTION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'transaction',
          protoPath: join(__dirname, '../../../proto/transaction.proto'),
          url: 'transaction-service:50051', // Docker internal network
        },
      },
    ]),
  ],
  controllers: [TransactionAggregatorController],
  providers: [TransactionAggregatorService],
})
export class TransactionAggregatorModule {}
```

### 3. API Gateway - gRPC Client Usage

```typescript
// apps/api-gateway/src/transaction-aggregator/transaction-aggregator.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

interface TransactionServiceClient {
  createUserTransaction(data: any): Observable<any>;
  getUserTransactions(data: any): Observable<any>;
  updateUserTransaction(data: any): Observable<any>;
  deleteUserTransaction(data: any): Observable<any>;
}

@Injectable()
export class TransactionAggregatorService implements OnModuleInit {
  private transactionService: TransactionServiceClient;

  constructor(
    @Inject('TRANSACTION_SERVICE') 
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.transactionService = this.client.getService<TransactionServiceClient>(
      'TransactionService',
    );
  }

  async createTransaction(userId: string, data: any) {
    const result = await lastValueFrom(
      this.transactionService.createUserTransaction({
        userId,
        amount: data.amount,
        category: data.category,
        note: data.note,
      }),
    );
    return result;
  }

  async getMyTransactions(userId: string, monthYear?: string) {
    const result = await lastValueFrom(
      this.transactionService.getUserTransactions({
        userId,
        monthYear,
      }),
    );
    return result.data;
  }
}
```

### 4. Transaction Service - Main Bootstrap

```typescript
// apps/transaction-svc/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(TransactionSvcModule);

  // Setup gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'transaction',
      protoPath: join(__dirname, '../../../proto/transaction.proto'),
      url: '0.0.0.0:50051',
    },
  });

  // Start both HTTP and gRPC
  await app.startAllMicroservices();
  await app.listen(3001);
  
  console.log('💰 Transaction Service (HTTP) is running on: http://localhost:3001');
  console.log('🔌 Transaction Service (gRPC) is running on: localhost:50051');
}
bootstrap();
```

---

## 🔒 Security & Authorization Flow

### JWT Validation trong Microservices

```typescript
// Transaction Service - JwtAuthGuard
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
      // Attach user data to request
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        roles: payload.roles,
      };
      
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Authorization Check

```typescript
// Check ownership before update/delete
async updateWithUser(id: string, userId: string, data: any) {
  // 1. Verify ownership
  const ownership = await this.userTransactionRepository.findOne({
    where: {
      transactionId: id,
      userId: userId,
      action: 'CREATE', // Only creator can modify
    },
  });

  if (!ownership) {
    throw new ForbiddenException(
      'You do not have permission to update this transaction'
    );
  }

  // 2. Update transaction
  const transaction = await this.transactionRepository.findOne({ 
    where: { id } 
  });
  
  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }

  Object.assign(transaction, data);
  const updated = await this.transactionRepository.save(transaction);

  // 3. Log action
  await this.userTransactionRepository.save({
    userId,
    transactionId: id,
    action: 'UPDATE',
  });

  return updated;
}
```

---

## 📊 Database Schema

### Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    note TEXT,
    date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_date_time ON transactions(date_time);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### User Transactions Table (Tracking)

```sql
CREATE TABLE user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, transaction_id)
);

CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_transaction_id ON user_transactions(transaction_id);
CREATE INDEX idx_user_transactions_action ON user_transactions(action);
```

### Users Table (Auth Service)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hashed
    roles TEXT[] DEFAULT ARRAY['user'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

---

## 🧪 Testing

### Manual Testing với cURL

```bash
# 1. Register
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "username": "testuser"
  }'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"

# 3. Create Transaction
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "category": "Food",
    "note": "Lunch"
  }'

# 4. Get My Transactions
curl -X GET http://localhost:3001/transactions \
  -H "Authorization: Bearer $TOKEN"

# 5. Get My Transaction IDs
curl -X GET http://localhost:3001/transactions/my/ids \
  -H "Authorization: Bearer $TOKEN"
```

### Automated Test Script

```bash
./test-transaction-user.sh
```

---

## 🎯 Best Practices

### 1. Error Handling

```typescript
// Always handle errors properly in gRPC
@GrpcMethod('TransactionService', 'CreateUserTransaction')
async createUserTransaction(data: CreateUserTransactionDto) {
  try {
    const transaction = await this.service.createWithUser(
      data.userId,
      { amount: data.amount, category: data.category }
    );
    
    return {
      success: true,
      message: 'Transaction created',
      data: transaction,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}
```

### 2. Type Safety

```typescript
// Use interfaces for type safety
interface CreateTransactionDto {
  userId: string;
  amount: number;
  category: string;
  note?: string;
}

// Validate input
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  note?: string;
}
```

### 3. Logging

```typescript
// Log important events
this.logger.log(`User ${userId} created transaction ${transaction.id}`);
this.logger.warn(`User ${userId} attempted to update transaction ${id} without permission`);
this.logger.error(`Failed to create transaction: ${error.message}`);
```

---

## 🚀 Performance Optimization

### 1. Connection Pooling

```typescript
// TypeORM configuration
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'transaction_db',
  entities: [TransactionEntity, UserTransactionEntity],
  synchronize: false,
  
  // Connection pooling
  extra: {
    max: 20,  // Maximum connections
    min: 5,   // Minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
```

### 2. gRPC Streaming (for large datasets)

```typescript
@GrpcStreamMethod('TransactionService', 'StreamTransactions')
streamTransactions(data: Observable<TransactionStreamRequest>): Observable<TransactionResponse> {
  return data.pipe(
    mergeMap(async (request) => {
      const transactions = await this.service.getTransactionsByUser(
        request.userId,
        request.filter,
      );
      
      // Stream each transaction
      return from(transactions).pipe(
        map((transaction) => ({
          success: true,
          message: 'Transaction streamed',
          data: transaction,
        })),
      );
    }),
  );
}
```

---

## 📚 References

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [gRPC Official Docs](https://grpc.io/docs/)
- [Protocol Buffers](https://protobuf.dev/)
- [JWT Best Practices](https://jwt.io/introduction)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

---

**Last Updated:** November 1, 2025  
**Version:** 1.0.0
