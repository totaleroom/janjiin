# Janjiin API Documentation

**Last Updated:** December 21, 2025

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
6. [Rate Limiting](#rate-limiting)
7. [Pagination](#pagination)
8. [Response Format](#response-format)

---

## Overview

The Janjiin API provides a RESTful interface for managing and accessing application resources. This documentation covers all available endpoints, authentication mechanisms, request/response formats, and error handling procedures.

**API Version:** 1.0.0

---

## Authentication

### Authentication Methods

The API supports the following authentication methods:

#### 1. Bearer Token (JWT)

The preferred method for API authentication. Include your JWT token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

**Example Request:**
```bash
curl -X GET https://api.janjiin.com/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. API Key

Include your API key in the `X-API-Key` header.

**Header Format:**
```
X-API-Key: <your_api_key>
```

**Example Request:**
```bash
curl -X GET https://api.janjiin.com/v1/resources \
  -H "X-API-Key: sk_live_1234567890abcdef"
```

#### 3. OAuth 2.0

Supported for third-party integrations.

**Authorization Endpoint:**
```
GET https://auth.janjiin.com/oauth/authorize?client_id=<your_client_id>&redirect_uri=<redirect_uri>&response_type=code&scope=read:profile,write:data
```

**Token Endpoint:**
```
POST https://auth.janjiin.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=<auth_code>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri>
```

### Obtaining Credentials

1. **JWT Token**: Login via the authentication endpoint
2. **API Key**: Generate from your account settings dashboard
3. **OAuth**: Register your application in the developer console

### Security Best Practices

- Never expose your API keys or tokens in client-side code
- Use HTTPS for all API requests
- Rotate API keys regularly
- Use short-lived JWT tokens (recommended: 1 hour)
- Store tokens securely in environment variables

---

## Base URL

```
https://api.janjiin.com/v1
```

All API endpoints are relative to this base URL.

---

## Error Handling

### Error Response Format

All error responses follow a standardized JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "additional context"
    }
  },
  "timestamp": "2025-12-21T05:37:47Z",
  "requestId": "req_123456789abcdef"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource successfully created |
| 204 | No Content - Successful request with no response body |
| 400 | Bad Request - Invalid parameters or malformed request |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Authenticated but lacks permission |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Request conflicts with current state |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |
| 503 | Service Unavailable - Server is temporarily down |

### Common Error Codes

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| INVALID_REQUEST | 400 | Request parameters are invalid |
| MISSING_FIELD | 400 | Required field is missing |
| INVALID_FORMAT | 400 | Data format is invalid |
| UNAUTHORIZED | 401 | Invalid or missing credentials |
| TOKEN_EXPIRED | 401 | JWT token has expired |
| INSUFFICIENT_PERMISSION | 403 | User lacks required permissions |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| VALIDATION_ERROR | 422 | Input validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Internal server error |

### Error Response Examples

**Example 1: Missing Required Field**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELD",
    "message": "Required field 'email' is missing",
    "details": {
      "field": "email",
      "requirement": "Email address is required"
    }
  },
  "timestamp": "2025-12-21T05:37:47Z",
  "requestId": "req_abc123def456"
}
```

**Example 2: Authentication Failed**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key or expired token",
    "details": {
      "hint": "Check your credentials and ensure your token hasn't expired"
    }
  },
  "timestamp": "2025-12-21T05:37:47Z",
  "requestId": "req_xyz789uvw123"
}
```

**Example 3: Rate Limit Exceeded**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60,
      "limit": 1000,
      "window": "1h"
    }
  },
  "timestamp": "2025-12-21T05:37:47Z",
  "requestId": "req_rate_limit_001"
}
```

---

## API Endpoints

### Authentication Endpoints

#### Login / Get JWT Token

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and obtain JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_1234567890",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  },
  "timestamp": "2025-12-21T05:37:47Z",
  "requestId": "req_login_001"
}
```

---

#### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Refresh expired JWT token

**Request Body:**
```json
{
  "refreshToken": "refresh_token_1234567890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate current session

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (204 No Content):**
```
(No response body)
```

---

### User Endpoints

#### Get User Profile

**Endpoint:** `GET /users/profile`

**Description:** Retrieve authenticated user's profile information

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-12-21T05:37:47Z",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Update User Profile

**Endpoint:** `PUT /users/profile`

**Description:** Update authenticated user's profile information

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "user",
    "preferences": {
      "theme": "light",
      "language": "en",
      "notifications": false
    },
    "updatedAt": "2025-12-21T05:37:47Z"
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### List All Users (Admin)

**Endpoint:** `GET /users`

**Description:** Retrieve list of all users (admin only)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |
| role | string | Filter by role (user, admin, moderator) |
| search | string | Search by name or email |
| sortBy | string | Sort field (createdAt, name, email) |
| sortOrder | string | Sort order (asc, desc) |

**Example Request:**
```bash
curl -X GET "https://api.janjiin.com/v1/users?page=1&limit=10&role=user&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user_123",
        "email": "user1@example.com",
        "name": "John Doe",
        "role": "user",
        "createdAt": "2025-01-15T10:30:00Z"
      },
      {
        "id": "user_124",
        "email": "user2@example.com",
        "name": "Jane Smith",
        "role": "user",
        "createdAt": "2025-02-20T14:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Get User by ID (Admin)

**Endpoint:** `GET /users/:userId`

**Description:** Retrieve specific user details (admin only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-12-21T05:37:47Z",
    "lastLogin": "2025-12-20T18:22:00Z"
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Delete User (Admin)

**Endpoint:** `DELETE /users/:userId`

**Description:** Delete user account (admin only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (204 No Content):**
```
(No response body)
```

---

### Resource Endpoints

#### Create Resource

**Endpoint:** `POST /resources`

**Description:** Create a new resource

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Sample Resource",
  "description": "This is a sample resource",
  "type": "document",
  "tags": ["tutorial", "guide"],
  "metadata": {
    "author": "John Doe",
    "category": "development"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "resource_456",
    "title": "Sample Resource",
    "description": "This is a sample resource",
    "type": "document",
    "tags": ["tutorial", "guide"],
    "createdBy": "user_123",
    "createdAt": "2025-12-21T05:37:47Z",
    "updatedAt": "2025-12-21T05:37:47Z",
    "metadata": {
      "author": "John Doe",
      "category": "development"
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### List Resources

**Endpoint:** `GET /resources`

**Description:** Retrieve list of resources with filtering and pagination

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |
| type | string | Filter by resource type |
| tags | string | Filter by tags (comma-separated) |
| search | string | Search by title or description |
| sortBy | string | Sort field (createdAt, title, updatedAt) |
| sortOrder | string | Sort order (asc, desc) |

**Example Request:**
```bash
curl -X GET "https://api.janjiin.com/v1/resources?page=1&limit=10&type=document&tags=tutorial&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "resource_456",
        "title": "Sample Resource",
        "type": "document",
        "tags": ["tutorial", "guide"],
        "createdBy": "user_123",
        "createdAt": "2025-12-21T05:37:47Z",
        "updatedAt": "2025-12-21T05:37:47Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Get Resource by ID

**Endpoint:** `GET /resources/:resourceId`

**Description:** Retrieve specific resource details

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| resourceId | string | Resource ID |

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "resource_456",
    "title": "Sample Resource",
    "description": "This is a sample resource",
    "type": "document",
    "tags": ["tutorial", "guide"],
    "content": "Resource content here...",
    "createdBy": "user_123",
    "createdAt": "2025-12-21T05:37:47Z",
    "updatedAt": "2025-12-21T05:37:47Z",
    "metadata": {
      "author": "John Doe",
      "category": "development",
      "views": 42
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Update Resource

**Endpoint:** `PUT /resources/:resourceId`

**Description:** Update resource details

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| resourceId | string | Resource ID |

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Resource Title",
  "description": "Updated description",
  "tags": ["updated", "guide"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "resource_456",
    "title": "Updated Resource Title",
    "description": "Updated description",
    "tags": ["updated", "guide"],
    "updatedAt": "2025-12-21T05:37:47Z"
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

#### Delete Resource

**Endpoint:** `DELETE /resources/:resourceId`

**Description:** Delete a resource

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| resourceId | string | Resource ID |

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (204 No Content):**
```
(No response body)
```

---

### Search Endpoints

#### Full-Text Search

**Endpoint:** `GET /search`

**Description:** Perform full-text search across resources

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query (required) |
| type | string | Filter by resource type |
| limit | integer | Results limit (default: 20) |
| offset | integer | Results offset (default: 0) |

**Example Request:**
```bash
curl -X GET "https://api.janjiin.com/v1/search?q=tutorial&type=document&limit=10" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "query": "tutorial",
    "results": [
      {
        "id": "resource_456",
        "title": "Sample Resource",
        "type": "document",
        "relevance": 0.95,
        "snippet": "This is a sample resource for learning tutorials..."
      }
    ],
    "totalResults": 5,
    "executionTime": "124ms"
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

### Health & Status Endpoints

#### Health Check

**Endpoint:** `GET /health`

**Description:** Check API service health status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-12-21T05:37:47Z",
    "uptime": 3600000,
    "database": "connected",
    "cache": "connected"
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit information in headers:

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Total requests allowed in the window |
| X-RateLimit-Remaining | Requests remaining in current window |
| X-RateLimit-Reset | Unix timestamp when limit resets |

### Rate Limits by Tier

| Tier | Requests/Hour | Requests/Minute |
|------|---------------|-----------------|
| Free | 1,000 | 60 |
| Standard | 10,000 | 600 |
| Professional | 100,000 | 6,000 |
| Enterprise | Custom | Custom |

### Example Rate Limit Response

```bash
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1703141887

{
  "success": true,
  "data": {...}
}
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset": "2025-12-21T06:37:47Z",
      "retryAfter": 3600
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

## Pagination

### Pagination Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (1-indexed, default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |

### Pagination Response Format

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

### Pagination Example

**Request:**
```bash
curl -X GET "https://api.janjiin.com/v1/resources?page=2&limit=10" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 150,
      "totalPages": 15,
      "hasNextPage": true,
      "hasPrevPage": true,
      "nextPage": 3,
      "prevPage": 1
    }
  },
  "timestamp": "2025-12-21T05:37:47Z"
}
```

---

## Response Format

### Standard Response Structure

All successful API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "timestamp": "2025-12-21T05:37:47Z",
  "requestId": "req_unique_identifier"
}
```

### Response Metadata

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Indicates if request was successful |
| data | object/array | Response payload |
| timestamp | string | ISO 8601 formatted timestamp |
| requestId | string | Unique request identifier for tracking |

### Null and Empty Response Handling

- Empty arrays are returned as: `[]`
- Null fields are explicitly included: `"field": null`
- Missing optional fields are omitted from responses

---

## Best Practices

1. **Always handle errors gracefully** - Check for error codes and implement retry logic for 5xx errors
2. **Use pagination** - Don't fetch all records at once; use limit/page parameters
3. **Cache responses** - Implement client-side caching where appropriate
4. **Monitor rate limits** - Track X-RateLimit-* headers to avoid hitting limits
5. **Use appropriate HTTP methods** - GET for retrieval, POST for creation, PUT for updates, DELETE for removal
6. **Validate input** - Ensure all required fields are provided before sending requests
7. **Log request IDs** - Use requestId for debugging and support tickets
8. **Implement exponential backoff** - For retries, use exponential backoff with jitter
9. **Secure credentials** - Store API keys and tokens in secure environment variables
10. **Use webhooks** - Subscribe to events instead of polling for changes

---

## Support and Feedback

For API support, issues, or feedback:

- **Email:** api-support@janjiin.com
- **Documentation:** https://docs.janjiin.com
- **Status Page:** https://status.janjiin.com
- **GitHub Issues:** https://github.com/totaleroom/janjiin/issues

---

**Generated:** December 21, 2025
**Version:** 1.0.0
