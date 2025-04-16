# LabRES API Documentation

This document provides comprehensive information about the LabRES API endpoints, their functionality, required parameters, and expected responses.

## Table of Contents

1. [Authentication](#authentication)
2. [Equipment](#equipment)
3. [Reservations](#reservations)
4. [Notifications](#notifications)
5. [User Management](#user-management)
6. [Team Management](#team-management)

## Authentication

### POST /api/auth/login

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "USER | ADMIN"
  }
}
```

### POST /api/auth/register

Registers a new user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string"
}
```

## Equipment

### GET /api/equipment

Returns a list of all equipment.

**Query Parameters:**
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status (AVAILABLE, IN_USE, MAINTENANCE)
- `search` (optional): Search term for equipment name or description

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "categoryId": "string",
    "status": "AVAILABLE | IN_USE | MAINTENANCE",
    "location": "string",
    "availability": "boolean",
    "category": {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  }
]
```

### GET /api/equipment/:id

Returns details for a specific piece of equipment.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "status": "AVAILABLE | IN_USE | MAINTENANCE",
  "location": "string",
  "availability": "boolean",
  "category": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

### POST /api/admin/equipment

Creates a new equipment item (admin only).

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "status": "AVAILABLE | IN_USE | MAINTENANCE",
  "location": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "status": "AVAILABLE | IN_USE | MAINTENANCE",
  "location": "string",
  "availability": "boolean"
}
```

### PUT /api/admin/equipment/:id

Updates an existing equipment item (admin only).

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "status": "AVAILABLE | IN_USE | MAINTENANCE",
  "location": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "status": "AVAILABLE | IN_USE | MAINTENANCE",
  "location": "string",
  "availability": "boolean"
}
```

## Reservations

### GET /api/reservations

Returns a list of reservations for the authenticated user.

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "equipmentId": "string",
    "startDate": "string (ISO date)",
    "endDate": "string (ISO date)",
    "status": "PENDING | APPROVED | REJECTED",
    "notes": "string",
    "equipment": {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "AVAILABLE | IN_USE | MAINTENANCE"
    }
  }
]
```

### POST /api/reservations

Creates a new reservation.

**Request Body:**
```json
{
  "equipmentId": "string",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "notes": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "equipmentId": "string",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "status": "PENDING",
  "notes": "string"
}
```

### GET /api/admin/reservations

Returns a list of all reservations (admin only).

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)
- `userId` (optional): Filter by user ID
- `equipmentId` (optional): Filter by equipment ID

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "equipmentId": "string",
    "startDate": "string (ISO date)",
    "endDate": "string (ISO date)",
    "status": "PENDING | APPROVED | REJECTED",
    "notes": "string",
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "equipment": {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "AVAILABLE | IN_USE | MAINTENANCE"
    }
  }
]
```

### PUT /api/admin/reservations/:id

Updates a reservation status (admin only).

**Request Body:**
```json
{
  "status": "APPROVED | REJECTED",
  "adminNotes": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "equipmentId": "string",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "status": "APPROVED | REJECTED",
  "notes": "string",
  "adminNotes": "string"
}
```

## Notifications

### GET /api/notifications

Returns a list of notifications for the authenticated user.

**Query Parameters:**
- `read` (optional): Filter by read status (true/false)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "title": "string",
    "message": "string",
    "type": "SYSTEM | RESERVATION | MESSAGE",
    "read": "boolean",
    "createdAt": "string (ISO date)"
  }
]
```

### PUT /api/notifications/:id/read

Marks a notification as read.

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "SYSTEM | RESERVATION | MESSAGE",
  "read": true,
  "createdAt": "string (ISO date)"
}
```

### POST /api/admin/notifications

Creates a new notification (admin only).

**Request Body:**
```json
{
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "SYSTEM | RESERVATION | MESSAGE"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "SYSTEM | RESERVATION | MESSAGE",
  "read": false,
  "createdAt": "string (ISO date)"
}
```

## User Management

### GET /api/admin/users

Returns a list of all users (admin only).

**Response:**
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "USER | ADMIN",
    "phoneNumber": "string",
    "createdAt": "string (ISO date)"
  }
]
```

### PUT /api/admin/users/:id

Updates a user's information (admin only).

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "role": "USER | ADMIN",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "USER | ADMIN",
  "phoneNumber": "string"
}
```

## Team Management

### GET /api/teams

Returns a list of teams the authenticated user belongs to.

**Response:**
```json
[
  {
    "id": "string",
    "teamName": "string",
    "leaderId": "string",
    "leader": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "members": [
      {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string"
      }
    ]
  }
]
```

### POST /api/teams

Creates a new team (user becomes team leader).

**Request Body:**
```json
{
  "teamName": "string",
  "memberEmails": ["string"]
}
```

**Response:**
```json
{
  "id": "string",
  "teamName": "string",
  "leaderId": "string",
  "members": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  ]
}
```

### PUT /api/teams/:id/members

Adds members to a team (team leader only).

**Request Body:**
```json
{
  "memberEmails": ["string"]
}
```

**Response:**
```json
{
  "id": "string",
  "teamName": "string",
  "leaderId": "string",
  "members": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  ]
}
```

### DELETE /api/teams/:id/members/:memberId

Removes a member from a team (team leader only).

**Response:**
```json
{
  "success": true
}
```
