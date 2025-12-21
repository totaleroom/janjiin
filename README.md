# Janjiin

> A modern, scalable platform for managing and discovering content with intelligent recommendations and seamless user experiences.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/totaleroom/janjiin)
[![Status](https://img.shields.io/badge/status-active-success.svg)](#)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Project Overview

Janjiin is a comprehensive platform designed to streamline content management, discovery, and recommendation services. Built with modern technologies and best practices, it provides a robust foundation for applications requiring intelligent content curation, user engagement, and scalable performance.

### Key Objectives

- **Content Management**: Efficiently store, organize, and manage diverse content types
- **Intelligent Discovery**: Provide users with personalized content recommendations
- **Seamless Experience**: Deliver fast, responsive, and intuitive user interfaces
- **Scalability**: Handle growing user bases and content libraries with ease
- **Data-Driven Insights**: Track and analyze user behavior for continuous improvement

## Features

### Core Features

- 📚 **Content Management System**
  - Create, update, and delete content items
  - Support for multiple content types (articles, videos, media)
  - Rich metadata and tagging system
  - Content categorization and organization

- 🤖 **Intelligent Recommendations**
  - Personalized content suggestions based on user preferences
  - Machine learning-powered recommendation engine
  - Real-time recommendation updates
  - Collaborative filtering support

- 👥 **User Management**
  - User registration and authentication
  - Profile management and preferences
  - User activity tracking
  - Role-based access control (RBAC)

- 🔍 **Search & Discovery**
  - Full-text search capabilities
  - Advanced filtering and sorting
  - Search analytics and trends
  - Autocomplete suggestions

- 📊 **Analytics & Insights**
  - User engagement metrics
  - Content performance tracking
  - Usage statistics and reports
  - Real-time dashboards

- 🔐 **Security**
  - JWT-based authentication
  - OAuth2 integration support
  - Data encryption and secure transmission
  - Rate limiting and DDoS protection

- 📱 **Responsive Design**
  - Mobile-first approach
  - Cross-browser compatibility
  - Progressive web app (PWA) support
  - Offline functionality

## Tech Stack

### Backend

| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | Runtime environment | 18.x+ |
| **Express.js** | Web framework | 4.x |
| **PostgreSQL** | Primary database | 14.x+ |
| **Redis** | Caching & sessions | 7.x+ |
| **Elasticsearch** | Search indexing | 8.x+ |
| **JWT** | Authentication | - |
| **Passport.js** | Authentication middleware | 0.6.x+ |

### Frontend

| Technology | Purpose | Version |
|---|---|---|
| **React** | UI library | 18.x+ |
| **TypeScript** | Type safety | 5.x+ |
| **Redux/Zustand** | State management | Latest |
| **Tailwind CSS** | Styling | 3.x+ |
| **Axios** | HTTP client | 1.x+ |
| **React Router** | Navigation | 6.x+ |

### DevOps & Tools

| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **Kubernetes** | Orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **Jest** | Testing framework |
| **ESLint/Prettier** | Code quality |
| **Nginx** | Reverse proxy |

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Docker and Docker Compose (optional)
- PostgreSQL 14.x or higher
- Redis 7.x or higher

### Installation

#### Option 1: Local Development Setup

```bash
# Clone the repository
git clone https://github.com/totaleroom/janjiin.git
cd janjiin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:migrate
npm run db:seed

# Start the development server
npm run dev
```

#### Option 2: Docker Setup

```bash
# Clone the repository
git clone https://github.com/totaleroom/janjiin.git
cd janjiin

# Build and run with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

### Verify Installation

```bash
# Test the API
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-21T05:34:38Z"}
```

### First Steps

1. **Register a new user**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
   ```

2. **Login and get authentication token**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}'
   ```

3. **Create your first content item**
   ```bash
   curl -X POST http://localhost:3000/api/content \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"My First Content","description":"Description here","type":"article","tags":["tech","tutorial"]}'
   ```

## Project Structure

```
janjiin/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── content.routes.ts
│   │   │   │   ├── users.routes.ts
│   │   │   │   └── recommendations.routes.ts
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   └── validators/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── content.service.ts
│   │   │   ├── recommendation.service.ts
│   │   │   └── search.service.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── models/
│   │   ├── config/
│   │   ├── utils/
│   │   ├── types/
│   │   └── app.ts
│   ├── tests/
│   ├── .env.example
│   ├── docker-compose.yml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── content/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── tests/
│   └── package.json
├── docs/
│   ├── api/
│   ├── architecture/
│   └── deployment/
└── README.md
```

## API Documentation

### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.janjiin.com/api/v1
```

### Authentication

All protected endpoints require an `Authorization` header with a valid JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Core Endpoints

#### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |
| POST | `/auth/refresh` | Refresh authentication token |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user profile |

#### Content Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/content` | List all content items |
| GET | `/content/:id` | Get specific content |
| POST | `/content` | Create new content |
| PUT | `/content/:id` | Update content |
| DELETE | `/content/:id` | Delete content |
| POST | `/content/:id/like` | Like content |
| GET | `/content/:id/comments` | Get content comments |

#### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/:id` | Get user profile |
| PUT | `/users/:id` | Update user profile |
| GET | `/users/:id/preferences` | Get user preferences |
| PUT | `/users/:id/preferences` | Update user preferences |
| GET | `/users/:id/history` | Get user activity history |

#### Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/recommendations` | Get personalized recommendations |
| GET | `/recommendations/trending` | Get trending content |
| GET | `/recommendations/similar/:id` | Get similar content |
| POST | `/recommendations/feedback` | Provide recommendation feedback |

#### Search

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search` | Search content and users |
| GET | `/search/suggestions` | Get search suggestions |
| GET | `/search/trending` | Get trending search terms |

### Example Requests

#### Get Content List

```bash
curl -X GET "http://localhost:3000/api/v1/content?page=1&limit=20&category=tech" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Content

```bash
curl -X POST http://localhost:3000/api/v1/content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Microservices",
    "description": "A comprehensive guide to microservices architecture",
    "content": "Microservices are...",
    "type": "article",
    "tags": ["architecture", "backend"],
    "category": "tech",
    "isPublished": true
  }'
```

#### Get Recommendations

```bash
curl -X GET "http://localhost:3000/api/v1/recommendations?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response Format

All API responses follow a standard format:

**Success Response (2xx)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Sample Content",
    "description": "A sample content item",
    "createdAt": "2025-12-21T05:34:38Z"
  },
  "meta": {
    "timestamp": "2025-12-21T05:34:38Z"
  }
}
```

**Error Response (4xx/5xx)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-21T05:34:38Z"
  }
}
```

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  (Web Browser, Mobile App, Desktop Client)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Presentation Layer (Frontend)                  │
│  React SPA | TypeScript | Redux State Management            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway / Load Balancer                    │
│  (Nginx | AWS ALB | Kong)                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Application Layer (Backend)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Express.js API Server                               │  │
│  │ - Authentication & Authorization                    │  │
│  │ - Request Validation                                │  │
│  │ - Business Logic                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐     ┌──────────┐
    │Database│      │ Cache  │     │  Search  │
    │        │      │        │     │          │
    │ POST   │      │ Redis  │     │Elastic   │
    │ SQL    │      │        │     │search    │
    └────────┘      └────────┘     └──────────┘
         │               │              │
         └───────────────┼──────────────┘
                         │
                         ▼
    ┌────────────────────────────────────┐
    │  Data Services Layer               │
    │  - Query optimization              │
    │  - Caching strategies              │
    │  - Data indexing                   │
    └────────────────────────────────────┘
```

### Key Components

#### 1. Frontend Architecture

- **React Components**: Modular, reusable UI components
- **State Management**: Redux/Zustand for centralized state
- **API Integration**: Axios for HTTP requests with interceptors
- **Routing**: React Router for client-side navigation

#### 2. Backend Architecture

- **Express.js Server**: RESTful API endpoints
- **Middleware Layer**: Authentication, validation, error handling
- **Service Layer**: Business logic and data operations
- **Database Abstraction**: ORM/Query builder for database operations

#### 3. Data Layer

- **PostgreSQL**: Primary relational database
  - Content metadata
  - User information
  - Relationships and transactions
  
- **Redis**: In-memory data store
  - Session management
  - Caching layer
  - Real-time data
  
- **Elasticsearch**: Full-text search engine
  - Content indexing
  - Fast searching
  - Analytics aggregation

### Design Patterns

| Pattern | Usage |
|---|---|
| **MVC** | Application structure |
| **Service Layer** | Business logic encapsulation |
| **Repository Pattern** | Data access abstraction |
| **Middleware** | Request/response processing |
| **Dependency Injection** | Component coupling reduction |
| **Factory Pattern** | Object creation |
| **Observer Pattern** | Event-driven operations |

### Scalability Considerations

1. **Horizontal Scaling**
   - Stateless API servers
   - Load balancer distribution
   - Database read replicas

2. **Caching Strategy**
   - Redis for frequently accessed data
   - CDN for static assets
   - Query result caching

3. **Database Optimization**
   - Index optimization
   - Query optimization
   - Connection pooling

4. **Asynchronous Processing**
   - Message queues (RabbitMQ/Kafka)
   - Background job processing
   - Event-driven architecture

## Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure database connection in .env
# DATABASE_URL=postgresql://user:password@localhost:5432/janjiin

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure API URL in .env
# REACT_APP_API_URL=http://localhost:3000/api/v1

# Start development server
npm start
```

## Configuration

### Environment Variables

#### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/janjiin
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRATION=7d

# Email Service
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_password
MAIL_FROM=noreply@janjiin.com

# AWS (if using S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=janjiin-bucket

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

#### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_WS_URL=ws://localhost:3000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PWA=true

# Third-party Services
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_GA_ID=your_google_analytics_id
```

## Development

### Running the Project

```bash
# Start both backend and frontend (from project root)
npm run dev

# Or individually
npm run dev:backend
npm run dev:frontend
```

### Development Tools

```bash
# Code linting
npm run lint

# Code formatting
npm run format

# Type checking
npm run type-check

# Security audit
npm audit
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── helpers/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── auth/
    └── content/
```

### Writing Tests

```typescript
describe('ContentService', () => {
  describe('getContent', () => {
    it('should return content by id', async () => {
      const content = await contentService.getContent('123');
      expect(content).toBeDefined();
      expect(content.id).toBe('123');
    });

    it('should throw error for non-existent content', async () => {
      await expect(contentService.getContent('invalid')).rejects.toThrow();
    });
  });
});
```

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace janjiin

# Apply configuration
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n janjiin
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL/TLS certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring and alerts set up
- [ ] Load balancing configured
- [ ] CDN configured for static assets
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers configured

## Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit with conventional commits: `git commit -m "feat: your feature"`
6. Push to your fork: `git push origin feature/your-feature`
7. Create a Pull Request

### Code Style

- Use TypeScript for all code
- Follow ESLint rules configured in the project
- Format code with Prettier
- Add JSDoc comments for public APIs

### Commit Convention

```
feat: add new feature
fix: fix a bug
docs: documentation changes
style: code style changes
refactor: refactor code
perf: performance improvements
test: add or update tests
chore: maintenance tasks
```

### Pull Request Process

1. Update README.md if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Request review from maintainers
5. Address feedback and push updates

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Getting Help

- 📚 **Documentation**: Check the [docs](docs/) directory
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs on GitHub Issues
- 📧 **Email**: support@janjiin.com

### Community

- Join our [Discord server](https://discord.gg/janjiin)
- Follow us on [Twitter](https://twitter.com/janjiin)
- Star us on [GitHub](https://github.com/totaleroom/janjiin)

### Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

---

**Made with ❤️ by the Janjiin team**

Last Updated: 2025-12-21
