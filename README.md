# NestJS Clean Architecture API

A production-ready NestJS application built with Clean Architecture principles, featuring RBAC authentication, master-slave database replication, comprehensive logging, rate limiting, and API versioning.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database Configuration](#database-configuration)
- [Features Implementation](#features-implementation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)

---

## ✨ Features

### Core Features
- ✅ **Clean Architecture** - Domain-Driven Design with clear separation of concerns
- ✅ **RBAC (Role-Based Access Control)** - Users, Roles, and Permissions system
- ✅ **JWT Authentication** - Access tokens and refresh tokens with rotation
- ✅ **Master-Slave Database** - Read/write separation for scalability
- ✅ **API Versioning** - URI-based versioning (`/api/v1/...`)
- ✅ **Pagination** - Offset-based pagination for all list endpoints
- ✅ **Comprehensive Logging** - Winston-based structured logging with correlation IDs
- ✅ **Rate Limiting** - Global and per-endpoint rate limiting
- ✅ **Exception Handling** - Global exception filters with consistent error responses
- ✅ **Request Correlation** - Automatic correlation ID generation and tracking
- ✅ **Swagger Documentation** - Interactive API documentation
- ✅ **Refresh Token Cleanup** - Scheduled job for expired token cleanup

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Refresh token rotation
- ✅ Rate limiting to prevent abuse
- ✅ Sensitive data filtering in logs
- ✅ Input validation with class-validator

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Controllers, DTOs, Filters)      │
├─────────────────────────────────────┤
│     Application Layer                │
│  (Services, Use Cases)               │
├─────────────────────────────────────┤
│     Domain Layer                     │
│  (Domain Models, Business Logic)    │
├─────────────────────────────────────┤
│     Infrastructure Layer             │
│  (Repositories, Entities, DB)       │
└─────────────────────────────────────┘
```

### Design Patterns Used

1. **Repository Pattern** - Abstract data access layer
2. **Mapper Pattern** - Convert between domain and entity objects
3. **Factory Pattern** - Domain object creation
4. **Template Method** - BaseRepository with hooks
5. **Decorator Pattern** - Metadata-based decorators
6. **Strategy Pattern** - JWT authentication strategy

---

## 📁 Project Structure

```
src/
├── auth/                          # Authentication module
│   ├── decorators/               # Auth decorators (@Public, @RequirePermission, etc.)
│   ├── dto/                      # Auth DTOs (Login, Register, etc.)
│   ├── guards/                   # Auth guards (JWT, Permission, Role)
│   ├── jobs/                     # Scheduled jobs (refresh token cleanup)
│   ├── services/                 # Auth services (refresh token cleanup)
│   ├── strategies/               # Passport strategies (JWT)
│   ├── utils/                    # Auth utilities
│   ├── auth.controller.ts        # Auth endpoints
│   ├── auth.module.ts           # Auth module
│   └── auth.service.ts          # Auth business logic
│
├── users/                        # Users module
│   ├── domain/                   # User domain model
│   ├── dto/                     # User DTOs
│   ├── infrastructure/          # User persistence layer
│   ├── users.controller.ts      # User endpoints
│   ├── users.module.ts          # User module
│   └── users.service.ts         # User business logic
│
├── roles/                        # Roles module (similar structure)
├── permissions/                  # Permissions module (similar structure)
├── posts/                        # Posts module (similar structure)
├── comments/                    # Comments module (similar structure)
│
├── common/                       # Shared/common code
│   ├── decorators/              # Common decorators (@UseSlaveDB, @SkipLogging)
│   ├── dto/                     # Common DTOs (Pagination, Error Response)
│   ├── filters/                 # Exception filters
│   ├── interceptors/             # Interceptors (DB Context, Correlation ID, Logging)
│   ├── interfaces/              # Common interfaces
│   ├── logger/                  # Logger service and configuration
│   ├── repositories/            # Base repository
│   └── utils/                   # Common utilities
│
├── config/                       # Configuration files
│   ├── database.config.ts      # Database configuration
│   ├── jwt.config.ts           # JWT configuration
│   ├── mikroorm.config.ts      # MikroORM configuration
│   ├── schedule.config.ts       # Schedule configuration
│   └── throttler.config.ts     # Rate limiting configuration
│
├── migrations/                   # Database migrations
└── main.ts                      # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nest-arch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL**
   ```bash
   # Using Homebrew (macOS)
   brew services start postgresql@14
   
   # Or manually
   pg_ctl -D /usr/local/var/postgres start
   ```

5. **Run migrations**
   ```bash
   npm run migration:up
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

7. **Access the application**
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api-docs

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### API Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate refresh token

#### Users (`/api/v1/users`)
- `GET /users` - Get paginated list of users (uses slave DB)
- `GET /users/:id` - Get user by ID (uses slave DB)
- `POST /users` - Create a new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Roles (`/api/v1/roles`)
- `GET /roles` - Get paginated list of roles (uses slave DB)
- `GET /roles/:id` - Get role by ID with permissions (uses slave DB)
- `POST /roles` - Create a new role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/permissions` - Assign permission to role
- `DELETE /roles/:id/permissions/:permissionId` - Remove permission from role

#### Permissions (`/api/v1/permissions`)
- `GET /permissions` - Get paginated list of permissions (uses slave DB)
- `GET /permissions/:id` - Get permission by ID (uses slave DB)
- `POST /permissions` - Create a new permission
- `PUT /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

#### Posts (`/api/v1/posts`)
- `GET /posts` - Get paginated list of posts (uses slave DB)
- `GET /posts/:id` - Get post by ID (uses slave DB)
- `GET /posts/author/:authorId` - Get posts by author (uses slave DB)
- `POST /posts` - Create a new post
- `PUT /posts/:id` - Update post
- `PUT /posts/:id/publish` - Publish a post
- `DELETE /posts/:id` - Delete post

#### Comments (`/api/v1/comments`)
- `GET /comments` - Get paginated list of comments (uses slave DB)
- `GET /comments/:id` - Get comment by ID (uses slave DB)
- `GET /comments/post/:postId` - Get comments by post (uses slave DB)
- `GET /comments/author/:authorId` - Get comments by author (uses slave DB)
- `POST /comments` - Create a new comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Pagination

All list endpoints support pagination:
```
GET /api/v1/users?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Register/Login** → Get `accessToken` and `refreshToken`
2. **Use Access Token** → Include in `Authorization: Bearer <token>` header
3. **Refresh Token** → Use refresh token to get new access token when expired
4. **Logout** → Invalidate refresh token

### Authorization

#### Public Endpoints
Use `@Public()` decorator to mark endpoints as public:
```typescript
@Public()
@Post('login')
async login() { ... }
```

#### Permission-Based Authorization
Use `@RequirePermission()` decorator:
```typescript
@RequirePermission('users', 'read')
@Get(':id')
async findOne() { ... }
```

#### Role-Based Authorization
Use `@RequireRole()` decorator:
```typescript
@RequireRole('admin')
@Delete(':id')
async delete() { ... }
```

### Files
- **Guards**: `src/auth/guards/`
- **Decorators**: `src/auth/decorators/`
- **Strategy**: `src/auth/strategies/jwt.strategy.ts`
- **Service**: `src/auth/auth.service.ts`

---

## 🗄️ Database Configuration

### Master-Slave Setup

The application supports master-slave database replication:

- **Master DB** (Port 5432): Write operations
- **Slave DB** (Port 5433): Read operations (replica)

### Using Slave DB

Use `@UseSlaveDB()` decorator on read endpoints:
```typescript
@Get()
@UseSlaveDB()
async findAll() { ... }
```

### Files
- **Configuration**: `src/config/database.config.ts`
- **MikroORM Config**: `src/config/mikroorm.config.ts`
- **Interceptor**: `src/common/interceptors/db-context.interceptor.ts`
- **Decorator**: `src/common/decorators/use-slave-db.decorator.ts`

### Migrations

```bash
# Create migration
npm run migration:create -- --name=MigrationName

# Run migrations
npm run migration:up

# Rollback migration
npm run migration:down

# List migrations
npm run migration:list

# Check pending migrations
npm run migration:pending
```

---

## 🎯 Features Implementation

### 1. API Versioning

**Implementation**: URI-based versioning (`/api/v1/...`)

**Files**:
- `src/main.ts` - Versioning configuration
- Controllers use `@Controller({ path: 'module', version: '1' })`

**Usage**:
```typescript
@Controller({ path: 'users', version: '1' })
export class UsersController { ... }
```

---

### 2. Rate Limiting

**Implementation**: Global and per-endpoint rate limiting using `@nestjs/throttler`

**Configuration**: `src/config/throttler.config.ts`

**Global Limits**: 100 requests per 60 seconds
**Per-Endpoint Overrides**:
- Login: 5 requests per minute
- Register: 3 requests per hour
- Refresh: 10 requests per minute

**Files**:
- `src/config/throttler.config.ts` - Configuration
- `src/app.module.ts` - ThrottlerModule setup
- Controllers use `@Throttle({ default: { limit: X, ttl: Y } })`

---

### 3. Centralized Logging

**Implementation**: Winston-based structured logging with correlation IDs

**Features**:
- Request/response logging
- Error logging with stack traces
- Correlation ID tracking
- Sensitive data filtering
- Log file rotation

**Files**:
- `src/common/logger/logger.service.ts` - Logger service
- `src/common/logger/logger.config.ts` - Logger configuration
- `src/common/logger/logger.interceptor.ts` - Request/response logging
- `src/common/logger/logger.module.ts` - Logger module

**Log Files**:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled rejections

---

### 4. Exception Handling

**Implementation**: Global exception filters

**Features**:
- Consistent error response format
- Correlation ID in errors
- Stack traces in development only
- Proper error logging

**Files**:
- `src/common/filters/http-exception.filter.ts` - HTTP exceptions
- `src/common/filters/all-exceptions.filter.ts` - All exceptions
- `src/common/dto/error-response.dto.ts` - Error response DTO

**Error Response Format**:
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "NotFoundException",
  "timestamp": "2025-01-15T...",
  "path": "/api/v1/users/123",
  "correlationId": "uuid-here"
}
```

---

### 5. Correlation IDs

**Implementation**: Automatic correlation ID generation and tracking

**Features**:
- UUID-based correlation IDs
- Present in request/response headers
- Tracked through all logs
- Supports custom correlation IDs

**Files**:
- `src/common/interceptors/correlation-id.interceptor.ts`

**Headers**:
- Request: `X-Correlation-Id: <uuid>`
- Response: `X-Correlation-Id: <uuid>`

---

### 6. Refresh Token Management

**Implementation**: Refresh tokens stored in database with rotation

**Features**:
- Token rotation on refresh
- Token invalidation on logout
- Scheduled cleanup of expired tokens
- Database storage (no cache)

**Files**:
- `src/auth/auth.service.ts` - Token generation and validation
- `src/auth/jobs/refresh-token-cleanup.job.ts` - Cleanup job
- `src/auth/services/refresh-token-cleanup.service.ts` - Cleanup service
- `src/config/schedule.config.ts` - Schedule configuration

**Cleanup Job**: Runs daily at 2 AM UTC (configurable)

---

### 7. Pagination

**Implementation**: Offset-based pagination for all list endpoints

**Files**:
- `src/common/dto/pagination-query.dto.ts` - Query DTO
- `src/common/dto/paginated-response.dto.ts` - Response DTO
- `src/common/repositories/base.repository.ts` - Base repository method

**Usage**:
```typescript
@Get()
async findAll(@Query() paginationQuery: PaginationQueryDto) {
  return this.service.findPaginated(
    paginationQuery.page,
    paginationQuery.limit,
  );
}
```

---

## 🔧 Environment Variables

See `env.example` for all available environment variables.

### Required Variables

```env
# Application
NODE_ENV=development
PORT=3000

# Database Master
DB_MASTER_HOST=localhost
DB_MASTER_PORT=5432
DB_MASTER_USER=postgres
DB_MASTER_PASSWORD=postgres
DB_MASTER_NAME=nestarch

# Database Slave
DB_SLAVE_HOST=localhost
DB_SLAVE_PORT=5433
DB_SLAVE_USER=postgres
DB_SLAVE_PASSWORD=postgres
DB_SLAVE_NAME=nestarch

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production

# Logging
LOG_LEVEL=info

# Rate Limiting
THROTTLER_TTL=60
THROTTLER_LIMIT=100

# Schedule
REFRESH_TOKEN_CLEANUP_ENABLED=true
REFRESH_TOKEN_CLEANUP_CRON=0 2 * * *
REFRESH_TOKEN_CLEANUP_BATCH_SIZE=1000
```

---

## 📜 Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug       # Start in debug mode

# Production
npm run build             # Build for production
npm run start:prod        # Start production server

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run e2e tests

# Database
npm run migration:create  # Create a new migration
npm run migration:up      # Run pending migrations
npm run migration:down    # Rollback last migration
npm run migration:list    # List all migrations
npm run migration:pending # Check pending migrations

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Test Structure

- Unit tests: `*.spec.ts` files alongside source files
- E2E tests: `test/` directory

---

## 📖 Additional Documentation

- **PostgreSQL Setup**: See `POSTGRES_START_GUIDE.md`
- **Master-Slave Setup**: See `MASTER_SLAVE_SETUP.md` (if exists)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Submit a pull request

---

## 📝 License

This project is licensed under the UNLICENSED license.

---

## 🎯 Key Files Reference

### Authentication
- `src/auth/auth.service.ts` - Authentication logic
- `src/auth/guards/jwt-auth.guard.ts` - JWT authentication guard
- `src/auth/guards/permission.guard.ts` - Permission guard
- `src/auth/guards/role.guard.ts` - Role guard

### Database
- `src/config/database.config.ts` - Database configuration
- `src/config/mikroorm.config.ts` - MikroORM configuration
- `src/common/repositories/base.repository.ts` - Base repository

### Logging
- `src/common/logger/logger.service.ts` - Logger service
- `src/common/logger/logger.interceptor.ts` - Request/response logging

### Exception Handling
- `src/common/filters/http-exception.filter.ts` - HTTP exception filter
- `src/common/filters/all-exceptions.filter.ts` - All exceptions filter

### Rate Limiting
- `src/config/throttler.config.ts` - Rate limiting configuration
- `src/app.module.ts` - ThrottlerModule setup

### API Versioning
- `src/main.ts` - Versioning configuration

---

## 🚀 Production Deployment

### Checklist

- [ ] Change all JWT secrets
- [ ] Set `NODE_ENV=production`
- [ ] Set `LOG_LEVEL=info`
- [ ] Configure production database credentials
- [ ] Set up log aggregation
- [ ] Configure rate limits based on load
- [ ] Enable SSL/TLS
- [ ] Set up monitoring
- [ ] Configure backup strategy

---

**Built with ❤️ using NestJS**
