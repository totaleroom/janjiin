# Architecture Documentation for Janjiin

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Layered Architecture](#layered-architecture)
5. [Design Patterns](#design-patterns)
6. [Data Flow](#data-flow)
7. [Technology Stack](#technology-stack)
8. [Scalability & Performance](#scalability--performance)
9. [Security Architecture](#security-architecture)
10. [Development Guidelines](#development-guidelines)

---

## Overview

Janjiin is designed as a modular, scalable system that follows clean architecture principles. The system is organized into distinct layers and components, ensuring separation of concerns, testability, and maintainability.

### Key Architectural Goals
- **Modularity**: Clear separation of concerns across layers
- **Scalability**: Support for horizontal and vertical scaling
- **Maintainability**: Well-documented, organized codebase
- **Testability**: Unit testable components with minimal dependencies
- **Security**: Multiple layers of security and data validation
- **Performance**: Optimized data access and processing

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│              (Web, Mobile, CLI Interfaces)                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              API Gateway & Middleware                        │
│       (Authentication, Logging, Rate Limiting, CORS)         │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Application Layer                           │
│          (Controllers, Services, Business Logic)             │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   Domain Layer                               │
│          (Models, Entities, Business Rules)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Infrastructure Layer                            │
│    (Database, Cache, External Services, File Storage)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. **Controllers**
Responsible for handling HTTP requests and routing them to appropriate services.

**Responsibilities:**
- Parse and validate incoming requests
- Call appropriate service layer methods
- Format and return responses
- Handle HTTP status codes

**Example Structure:**
```
controllers/
├── userController.js
├── productController.js
├── orderController.js
└── analyticsController.js
```

### 2. **Services**
Contains business logic and orchestrates operations across different layers.

**Responsibilities:**
- Implement business rules and workflows
- Orchestrate operations across repositories and external services
- Handle error cases and validation
- Manage transactions

**Example Structure:**
```
services/
├── userService.js
├── productService.js
├── orderService.js
├── paymentService.js
└── notificationService.js
```

### 3. **Repositories**
Data access layer that abstracts database operations.

**Responsibilities:**
- Database query execution
- CRUD operations
- Query optimization
- Cache integration

**Example Structure:**
```
repositories/
├── userRepository.js
├── productRepository.js
├── orderRepository.js
└── baseRepository.js
```

### 4. **Models & Entities**
Define the structure and constraints of domain objects.

**Responsibilities:**
- Schema definition
- Data validation rules
- Relationships between entities
- Business logic for entities

**Example Structure:**
```
models/
├── User.js
├── Product.js
├── Order.js
├── Payment.js
└── schemas/
    ├── userSchema.js
    └── productSchema.js
```

### 5. **Middleware**
Intercepts requests to perform cross-cutting concerns.

**Responsibilities:**
- Authentication/Authorization
- Request logging
- Error handling
- Request/Response transformation
- Rate limiting

**Example Structure:**
```
middleware/
├── authMiddleware.js
├── loggingMiddleware.js
├── errorHandlerMiddleware.js
├── validationMiddleware.js
└── corsMiddleware.js
```

### 6. **Utilities & Helpers**
Common functions and utilities used across the application.

**Responsibilities:**
- Date/time utilities
- String manipulation
- Encryption/Hashing
- Response formatting
- Error creation

**Example Structure:**
```
utils/
├── dateUtils.js
├── stringUtils.js
├── encryptionUtils.js
├── responseFormatter.js
├── errorHandler.js
└── validators.js
```

### 7. **Configuration**
Application configuration management.

**Responsibilities:**
- Environment-specific settings
- Database configuration
- API endpoints
- Feature flags

**Example Structure:**
```
config/
├── database.js
├── environment.js
├── constants.js
└── features.js
```

---

## Layered Architecture

### Layer 1: Presentation Layer
**Purpose:** Handle user interfaces and API endpoints

**Components:**
- REST API endpoints
- Request validation
- Response formatting
- Error message translation

**Key Interfaces:**
```javascript
// Example endpoint
GET /api/v1/users/:id
POST /api/v1/users
PUT /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Layer 2: Application Layer
**Purpose:** Orchestrate application logic and workflows

**Components:**
- Controllers
- Service layer
- DTOs (Data Transfer Objects)
- Request/Response handlers

**Responsibilities:**
- Parse incoming requests
- Call business logic
- Transform data
- Handle application-specific operations

### Layer 3: Domain Layer
**Purpose:** Encapsulate business logic and rules

**Components:**
- Domain entities
- Value objects
- Domain services
- Business rule validation

**Key Principle:** This layer should be independent of any framework or external library

### Layer 4: Data Access Layer
**Purpose:** Handle all data persistence operations

**Components:**
- Repositories
- Query builders
- Database connections
- ORM/ODM mappers
- Cache layer

**Features:**
- Query optimization
- Connection pooling
- Transaction management
- Caching strategies

### Layer 5: Infrastructure Layer
**Purpose:** Provide technical implementations

**Components:**
- Database drivers
- External API clients
- File storage systems
- Message brokers
- Email services
- Logging systems

---

## Design Patterns

### 1. **Repository Pattern**
Abstracts data access logic and provides a collection-like interface.

```javascript
// Interface
class BaseRepository {
  async findById(id) { }
  async findAll(filters) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }
}

// Implementation
class UserRepository extends BaseRepository {
  async findById(id) {
    return User.findById(id);
  }
}
```

**Benefits:**
- Decouples business logic from data access
- Easier to test (can mock repository)
- Easy to switch databases

### 2. **Service Pattern**
Encapsulates business logic and provides services to controllers.

```javascript
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async createUser(userData) {
    // Business logic here
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
```

**Benefits:**
- Centralized business logic
- Reusable across controllers
- Easier to test in isolation

### 3. **Dependency Injection Pattern**
Injects dependencies rather than creating them internally.

```javascript
// Instead of creating dependencies inside
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
}

// Instantiate with dependencies
const userService = new UserService(
  new UserRepository(),
  new EmailService()
);
```

**Benefits:**
- Loose coupling
- Easy to test with mocks
- Flexible to swap implementations

### 4. **Factory Pattern**
Creates objects without specifying exact classes.

```javascript
class ServiceFactory {
  static createUserService() {
    return new UserService(
      new UserRepository(),
      new EmailService()
    );
  }

  static createOrderService() {
    return new OrderService(
      new OrderRepository(),
      new PaymentService()
    );
  }
}
```

### 5. **Singleton Pattern**
Ensures a class has only one instance.

```javascript
class Database {
  static instance = null;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

**Use Cases:**
- Database connections
- Logger instances
- Configuration managers

### 6. **Observer/Pub-Sub Pattern**
Objects notify other objects about state changes.

```javascript
class EventEmitter {
  subscribe(event, handler) {
    // Store subscription
  }

  emit(event, data) {
    // Notify all subscribers
  }
}

// Usage
eventEmitter.subscribe('user.created', async (user) => {
  await emailService.sendWelcomeEmail(user);
});
```

### 7. **Strategy Pattern**
Encapsulates algorithms in separate classes.

```javascript
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  async process(amount) {
    return this.strategy.pay(amount);
  }
}

class CreditCardStrategy {
  async pay(amount) {
    // Credit card payment logic
  }
}

class PayPalStrategy {
  async pay(amount) {
    // PayPal payment logic
  }
}
```

### 8. **Decorator Pattern**
Adds behavior to objects dynamically.

```javascript
function authRequired(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    if (!this.isAuthenticated()) {
      throw new UnauthorizedException();
    }
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

class UserController {
  @authRequired
  async getProfile() {
    // Requires authentication
  }
}
```

---

## Data Flow

### Request-Response Cycle

```
1. Client Request
   ↓
2. API Gateway/Middleware
   ├─ Authentication
   ├─ Validation
   └─ Logging
   ↓
3. Controller
   ├─ Parse request
   └─ Call service
   ↓
4. Service Layer
   ├─ Business logic
   ├─ Validation
   └─ Call repository
   ↓
5. Repository Layer
   ├─ Check cache
   ├─ Query database
   └─ Update cache
   ↓
6. Service Layer
   ├─ Format response
   └─ Trigger events
   ↓
7. Controller
   ├─ Format HTTP response
   └─ Set status codes
   ↓
8. Middleware
   ├─ Logging
   └─ Response transformation
   ↓
9. Client Response
```

### Example: Create User Flow

```
POST /api/v1/users
│
├─ authMiddleware (verify JWT)
├─ validationMiddleware (validate request body)
├─ loggingMiddleware (log request)
│
├─ UserController.create()
│  │
│  ├─ Validate input
│  └─ Call userService.createUser()
│     │
│     ├─ Check if email exists
│     ├─ Hash password
│     ├─ Create user via repository
│     ├─ Send welcome email
│     ├─ Emit 'user.created' event
│     └─ Return user object
│  │
│  └─ Format response
│
├─ errorHandlerMiddleware (if any errors)
└─ Send HTTP response (201 with user data)
```

---

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js / Fastify (or similar)
- **Language:** JavaScript/TypeScript

### Database
- **Primary:** MongoDB / PostgreSQL (depending on data model)
- **Cache:** Redis
- **Search:** Elasticsearch (if needed)

### Authentication
- **JWT:** JSON Web Tokens
- **OAuth2:** Third-party authentication

### External Services
- **Email:** SendGrid / Mailgun
- **Payment:** Stripe / PayPal
- **Cloud Storage:** AWS S3 / Google Cloud Storage
- **Logging:** Winston / Bunyan

### Testing
- **Unit Tests:** Jest / Mocha
- **Integration Tests:** Supertest
- **E2E Tests:** Cypress / Playwright

### DevOps
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions / Jenkins
- **Monitoring:** Prometheus / Grafana

---

## Scalability & Performance

### Horizontal Scaling
- **Load Balancer:** Distribute traffic across multiple instances
- **Stateless Services:** Services don't maintain session state
- **Distributed Cache:** Shared Redis instance
- **Database Replication:** Master-slave or multi-master setup

### Caching Strategy
```javascript
// Multi-level caching
1. Application-level cache (Memory)
2. Redis cache (Distributed)
3. Database cache (Query results)
4. CDN cache (Static assets)
```

### Database Optimization
- **Indexing:** Index frequently queried fields
- **Connection Pooling:** Reuse database connections
- **Query Optimization:** Minimize queries, use aggregation
- **Partitioning:** Partition large tables
- **Read Replicas:** Separate read and write operations

### API Performance
- **Pagination:** Limit response size
- **Filtering:** Allow clients to request specific fields
- **Compression:** GZIP compression for responses
- **Rate Limiting:** Prevent abuse
- **Async Processing:** Use message queues for long operations

---

## Security Architecture

### Authentication & Authorization
```javascript
// JWT-based authentication
GET /api/v1/users/me
├─ Verify JWT token in Authorization header
├─ Validate token signature
├─ Check token expiration
└─ Extract user information from token

// Role-based access control
@authRequired
@authorize(['ADMIN', 'MANAGER'])
async deleteUser(id) {
  // Only accessible to admin/manager roles
}
```

### Data Protection
- **Encryption:** Encrypt sensitive data at rest
- **HTTPS:** Always use HTTPS for data in transit
- **Hashing:** Hash passwords using bcrypt/argon2
- **Secrets Management:** Use environment variables for secrets

### Input Validation
```javascript
// Validate all user inputs
const userSchema = {
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  }
};
```

### API Security
- **CORS:** Restrict cross-origin requests
- **Rate Limiting:** Prevent brute force attacks
- **SQL Injection Prevention:** Use parameterized queries
- **XSS Protection:** Sanitize output
- **CSRF Protection:** Validate origin and referrer

---

## Development Guidelines

### Code Organization

```
project/
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── productController.js
│   ├── services/
│   │   ├── userService.js
│   │   └── productService.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   └── productRepository.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandlerMiddleware.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   └── validators.js
│   ├── config/
│   │   ├── database.js
│   │   └── environment.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env
├── .env.example
├── package.json
└── README.md
```

### Naming Conventions
- **Files:** camelCase (userController.js)
- **Classes:** PascalCase (UserService)
- **Functions:** camelCase (getUserById)
- **Constants:** UPPER_SNAKE_CASE (MAX_RETRIES)
- **Variables:** camelCase (userData)

### Error Handling
```javascript
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}
```

### Testing Strategy
```javascript
// Unit test example
describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn()
    };
    userService = new UserService(mockUserRepository);
  });

  test('should create user successfully', async () => {
    const userData = { email: 'test@example.com' };
    mockUserRepository.create.mockResolvedValue({ id: 1, ...userData });

    const result = await userService.createUser(userData);

    expect(result.email).toBe('test@example.com');
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

### Version Control
- **Branch Strategy:** Git Flow (main, develop, feature/*, hotfix/*)
- **Commit Messages:** Conventional commits (feat:, fix:, docs:, etc.)
- **Code Reviews:** All PRs require review before merge

### Documentation
- **API Documentation:** OpenAPI/Swagger specs
- **Code Comments:** Focus on "why" not "what"
- **README:** Project setup and overview
- **ARCHITECTURE.md:** This document
- **CONTRIBUTING.md:** Contribution guidelines

---

## Conclusion

This architecture provides a solid foundation for building scalable, maintainable applications. Key principles to remember:

1. **Separation of Concerns:** Each layer has a specific responsibility
2. **Dependency Injection:** Use DI to manage dependencies
3. **Single Responsibility:** Each class/function should have one reason to change
4. **Open/Closed Principle:** Open for extension, closed for modification
5. **Testability:** Write code that's easy to test in isolation

For questions or updates to this architecture, please refer to the contributing guidelines and create a pull request.

---

**Last Updated:** December 21, 2025
**Maintainer:** Architecture Team
