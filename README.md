# 💰 My Finance - NestJS Microservices

Hệ thống quản lý tài chính cá nhân được xây dựng với NestJS microservices architecture, Docker containerization và tích hợp database management UIs.

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (MySQL)                    │
│                   http://localhost:3000                    │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
          ┌───────▼─────────┐         ┌───────▼─────────┐         ┌───────────────┐
          │ Transaction Svc │         │  Account Svc    │         │   Auth Svc    │
          │  (PostgreSQL)   │         │   (MongoDB)     │         │ (PostgreSQL)  │
          │      :3001      │         │      :3002      │         │     :3003     │
          └─────────────────┘         └─────────────────┘         └───────────────┘
```

## 🔐 Authentication

Hệ thống sử dụng **JWT-based email authentication**:

- **Register**: Email + Password (tự động nhận role USER)
- **Login**: Email-based authentication
- **Protected Routes**: JWT token required
- **Role-based Access**: USER, ADMIN, GUEST roles

📖 Chi tiết: Xem [EMAIL-AUTH-UPDATE.md](./EMAIL-AUTH-UPDATE.md)

**Quick Test:**
```bash
# Register
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123456"}'

# Login
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

## 🚀 Quick Start

### 📋 Yêu cầu
- Node.js 18+
- Docker & Docker Compose
- npm/yarn

### ⚡ Khởi động nhanh

#### 1. Development Mode (Recommended)
```bash
# Khởi động databases trong Docker
./docker-manage.sh local

# Chạy services locally (3 terminals riêng biệt)
npm run start:gateway      # Port 3000
npm run start:transaction  # Port 3001  
npm run start:account      # Port 3002
```

#### 2. Full Docker Production
```bash
# Khởi động toàn bộ hệ thống trong Docker
./docker-manage.sh prod

# Hoặc sử dụng npm scripts
npm run docker:up
```

## 🔧 Cấu hình

### Database Connections

| Service | Database | Port (Local) | Port (Docker) |
|---------|----------|--------------|---------------|
| Transaction | PostgreSQL | 5433 | 5432 |
| Account | MongoDB | 27018 | 27017 |
| Gateway | MySQL | 3307 | 3306 |

### Environment Detection
Hệ thống tự động phát hiện môi trường:
- `NODE_ENV=production` → Sử dụng Docker database hosts
- Development → Sử dụng localhost với ports khác

## 📊 Database Management UIs

### Local Development
- **pgAdmin**: http://localhost:5051 (PostgreSQL)
- **Mongo Express**: http://localhost:8082 (MongoDB)  
- **phpMyAdmin**: http://localhost:8083 (MySQL)

### Production Docker
- **pgAdmin**: http://localhost:5050
- **Mongo Express**: http://localhost:8081
- **phpMyAdmin**: http://localhost:8080

## 📚 API Documentation

Swagger UI có sẵn tại:
- **API Gateway**: http://localhost:3000/api
- **Transaction Service**: http://localhost:3001/api
- **Account Service**: http://localhost:3002/api
- **Auth Service**: http://localhost:3003/api 🔐

## 🛠️ Scripts Hỗ trợ

### Docker Management
```bash
./docker-manage.sh [command]

Commands:
  prod, production    # Khởi động production environment
  local, dev          # Khởi động local development (databases only)
  stop               # Dừng tất cả services
  reset              # Reset toàn bộ data
  logs [local]       # Xem logs
  status             # Kiểm tra trạng thái services
  build              # Build application
  help               # Hiển thị help
```

### NPM Scripts
```bash
# Development
npm run start:gateway      # API Gateway
npm run start:transaction  # Transaction Service
npm run start:account      # Account Service
npm run start:auth         # Auth Service

# Docker shortcuts
npm run docker:up          # Start production environment
npm run docker:up:bg       # Start in background
npm run docker:local       # Start local databases
npm run docker:down        # Stop all services
npm run docker:reset       # Reset all data
npm run docker:logs        # View logs

# Build & Test
npm run build              # Build application
npm run test               # Run tests
npm run lint               # Lint code
```

## 🔐 Default Credentials

### Database Credentials
```bash
# PostgreSQL
Host: localhost:5433 (local) / localhost:5432 (docker)
Username: postgres
Password: postgres123
Database: transaction_db

# MongoDB
Host: localhost:27018 (local) / localhost:27017 (docker)
Username: admin
Password: admin123
Database: account_db
URI: mongodb://admin:admin123@localhost:27018/account_db

# MySQL
Host: localhost:3307 (local) / localhost:3306 (docker)
Username: mysql_user
Password: mysql123
Database: gateway_db
```

### UI Tool Credentials
```bash
# pgAdmin
Email: admin@myfinance.com
Password: admin123

# Mongo Express
Username: admin
Password: admin123

# phpMyAdmin
Username: mysql_user
Password: mysql123
```

## 🚀 Features

### ✅ Completed
- [x] Multi-database microservices architecture
- [x] Docker containerization with UI tools
- [x] Swagger API documentation
- [x] Comprehensive error handling
- [x] Response standardization with null field removal
- [x] Environment-based configuration
- [x] Database connection pooling
- [x] Sample data initialization

### 🔄 Planned
- [ ] Authentication & Authorization
- [ ] Unit & Integration tests
- [ ] API rate limiting
- [ ] Redis caching
- [ ] Frontend application

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Kiểm tra containers đang chạy
docker ps

# Xem logs database
docker logs my_finance_postgres_local

# Reset databases
./docker-manage.sh reset
```

#### 2. Port Already in Use
```bash
# Tìm process đang sử dụng port
lsof -i :3000

# Kill process
sudo lsof -t -i:3000 | xargs kill -9
```

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Xem logs: `./docker-manage.sh logs`
3. Reset environment: `./docker-manage.sh reset`
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# APIDoAn
