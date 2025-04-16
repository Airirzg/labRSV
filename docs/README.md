# LabRES Documentation

Welcome to the comprehensive documentation for the Laboratory Reservation System (LabRES). This documentation provides detailed information about the system architecture, API endpoints, and user guides for different roles.

## Table of Contents

1. [System Overview](#system-overview)
2. [API Documentation](#api-documentation)
3. [User Guides](#user-guides)
4. [Technical Documentation](#technical-documentation)
5. [Development Guidelines](#development-guidelines)

## System Overview

LabRES is a comprehensive laboratory equipment reservation and management system designed to streamline the process of reserving and utilizing laboratory equipment. The system supports multiple user roles, team-based reservations, and real-time notifications.

### Key Features

- **Equipment Management**: Catalog and manage laboratory equipment
- **Reservation System**: Schedule and manage equipment reservations
- **Team Collaboration**: Create teams and manage team-based reservations
- **Real-time Notifications**: Stay informed about reservation status and system events
- **Admin Dashboard**: Comprehensive tools for system administrators
- **User Management**: Manage user accounts and permissions

## API Documentation

The API documentation provides detailed information about all available endpoints, request parameters, and response formats.

- [API Reference](./api/README.md): Complete API documentation

## User Guides

User guides are available for different roles within the system:

- [User Guide](./user-guides/user-guide.md): For regular users of the system
- [Team Leader Guide](./user-guides/team-leader-guide.md): For team leaders managing group reservations
- [Administrator Guide](./user-guides/admin-guide.md): For system administrators

## Technical Documentation

- [Application Hierarchy](./APP_HIERARCHY.md): Overview of the application structure
- [Database Schema](./database-class-diagram.puml): PlantUML diagram of the database schema

## Development Guidelines

### Code Organization

The codebase follows a feature-based organization:

- **Pages**: Next.js pages for routing and API endpoints
- **Components**: Reusable UI components
- **Context**: React context providers for state management
- **Lib**: Core libraries and utilities
- **Middleware**: Authentication and request processing
- **Store**: Redux store for global state management
- **Utils**: Helper functions and utilities

### State Management

The application uses a combination of:
- Redux for global state
- React Context for authentication
- Local component state where appropriate
- Server-sent events (SSE) for real-time updates

### Error Handling

A consistent approach to error handling is implemented throughout the application:
- Global error boundary for React components
- Standardized API error responses
- Form validation with detailed error messages
- Loading states for asynchronous operations

### Security Practices

The application implements several security measures:
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- CSRF protection
- Input validation with Zod

## Getting Started

To set up the development environment:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the application at `http://localhost:3000`
