# LabRSV System Requirements Analysis

## 1. Technology Stack

### Frontend
- **Framework**: Next.js (React-based framework)
- **UI Components**: React Bootstrap, Bootstrap 5
- **State Management**: Redux (@reduxjs/toolkit)
- **Form Handling**: Native React forms
- **Styling**: SASS, Bootstrap CSS
- **Icons**: Bootstrap Icons, React Icons
- **Data Visualization**: ApexCharts
- **File Upload**: React Dropzone

### Backend
- **Framework**: Next.js API Routes
- **Database ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Email Services**: SendGrid (@sendgrid/mail)
- **File Storage**: AWS S3

### Database
- **Type**: PostgreSQL
- **Schema Management**: Prisma Schema

## 2. Database Schema

### User Model
- Fields: id, firstName, lastName, phoneNumber, email, password, createdAt, updatedAt, role
- Role enum: USER, ADMIN
- Relationships: One-to-many with Notification, Reservation, TeamMember, Message

### Team Model
- Fields: id, teamName, leaderId, createdAt, updatedAt
- Relationships: One-to-many with Reservation, TeamMember

### TeamMember Model
- Fields: id, userId, teamId, joinedAt
- Constraints: Unique constraint on [userId, teamId]
- Relationships: Many-to-one with User and Team

### Equipment Model
- Fields: id, name, description, categoryId, location, availability, createdAt, updatedAt, imageUrl, imageUrls, status, isDeleted
- Status enum: AVAILABLE, MAINTENANCE, IN_USE
- Relationships: Many-to-one with Category, One-to-many with Reservation

### Reservation Model
- Fields: id, startDate, endDate, status, notes, createdAt, updatedAt, userId, equipmentId, teamId
- Status enum: PENDING, APPROVED, REJECTED, ONGOING, FINISHED
- Relationships: Many-to-one with User, Equipment, and Team
- Indexes: userId, teamId, equipmentId, [startDate, endDate]

### ORM
- Using Prisma ORM for database interactions

## 3. Authentication and Authorization

### Authentication Method
- JWT-based authentication
- Token stored in localStorage
- Token contains user information (id, email, firstName, lastName, role)

### Role Management
- Two primary roles: USER and ADMIN
- Role-based access control implemented in API routes
- Team roles managed through relationships (Team Leader is identified by leaderId in Team model)

### Authorization Middleware
- Custom middleware in API routes to verify JWT tokens
- Role-based access checks in API handlers

## 4. Team Registration Form

### Form Structure
- Single-step registration process for teams
- Required fields: teamName, leaderId
- Team creation tied to the current user as leader

### Validation
- Server-side validation for required fields
- Unique team name validation

### Optional Fields
- None currently specified in the schema

## 5. Team Management

### Notifications
- In-app notifications through Notification model
- Email notifications via SendGrid
- Notification types: RESERVATION_UPDATE, EQUIPMENT_UPDATE, SYSTEM, MESSAGE

### Team Member Tracking
- TeamMember model tracks membership
- Timestamps for when members joined

### Limitations
- No explicit limits on team size or number of teams per leader

## 6. Join Mechanism

### Team Discovery
- Only authenticated users can view teams
- No public/private distinction in current schema

### Request Storage
- No dedicated model for join requests or invitations
- TeamMember model only tracks active memberships

### Member Departure
- No specific handling for members leaving teams in current schema

## 7. Profile Page Integration

### Team Display
- User profile shows teams led and joined
- No specific UI separation mentioned in code

### Contributions
- No explicit contribution tracking system

### Request Status
- No dedicated UI for showing request statuses

## 8. Optional Features

### File Sharing
- File storage using AWS S3
- Image upload functionality for equipment
- Multiple image support with imageUrls array

### Messaging
- Message model with threading capability (parentId reference)
- Message status tracking (UNREAD, READ, ARCHIVED)
- Not real-time, database-stored messages

## 9. Error Handling and Validation

### Error Communication
- Toast notifications via react-toastify
- API responses with error messages

### Validation Approach
- Server-side validation in API routes
- Client-side validation in form components
- Some form validation using zod

## 10. UI/UX Design

### Design System
- Bootstrap 5 as the primary design system
- Responsive design for different screen sizes
- Consistent styling across components

### Component Structure
- Modular components organized by feature
- Reusable UI components (forms, tables, etc.)

## 11. Deployment and Testing

### Testing
- No explicit testing framework visible in package.json
- Manual testing appears to be the primary approach

### Deployment
- No specific CI/CD pipeline mentioned
- Standard Next.js build and deployment process
