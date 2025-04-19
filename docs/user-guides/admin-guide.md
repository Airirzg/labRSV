# Administrator Guide - LabRES

This guide provides comprehensive instructions for administrators of the Laboratory Reservation System (LabRES).

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Equipment Management](#equipment-management)
4. [Reservation Management](#reservation-management)
5. [User Management](#user-management)
6. [Team Management](#team-management)
7. [Notification System](#notification-system)
8. [System Settings](#system-settings)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Admin Dashboard

1. Log in to the system using your admin credentials:
   - Email: `admin@example.com` (or your assigned admin email)
   - Password: Your secure admin password

2. Upon successful login, you'll be redirected to the main dashboard or you can navigate to the admin area by clicking on "Admin Dashboard" in the navigation menu.

### Admin Dashboard Layout

The admin dashboard is organized into several sections:
- **Overview**: Key statistics and metrics
- **Equipment Management**: Add, edit, and manage equipment
- **Reservation Management**: View and process reservation requests
- **User Management**: Manage user accounts and permissions
- **Team Management**: Oversee teams and their members
- **Messages**: Communication system for users and admins
- **System Settings**: Configure system parameters

## Dashboard Overview

The dashboard provides a quick overview of the system's status:

- **Total Reservations**: The total number of reservations in the system
- **Pending Reservations**: Reservations awaiting approval
- **Active Reservations**: Currently active reservations
- **Available Equipment**: Number of equipment items available for reservation

The dashboard also includes:
- **Reservation Calendar**: Visual representation of all reservations
- **Recent Activity**: Latest actions in the system
- **System Alerts**: Important notifications requiring attention

## Equipment Management

### Adding New Equipment

1. Navigate to **Equipment Management** in the admin sidebar
2. Click the **Add Equipment** button
3. Fill in the required information:
   - Name
   - Description
   - Category (select from dropdown)
   - Status (Available, In Use, Maintenance)
   - Location
4. Click **Save** to add the equipment to the system

### Editing Equipment

1. In the Equipment Management section, find the equipment you wish to edit
2. Click the **Edit** button (pencil icon)
3. Update the necessary fields
4. Click **Save** to apply changes

### Managing Equipment Status

1. To change equipment status, find the equipment in the list
2. Click the **Status** dropdown
3. Select the appropriate status:
   - **Available**: Equipment is ready for reservation
   - **In Use**: Currently being used (automatically set when reservation is active)
   - **Maintenance**: Temporarily unavailable due to maintenance
4. Add notes if necessary to explain the status change
5. Click **Update** to save changes

### Equipment Categories

1. To manage categories, click the **Categories** tab in Equipment Management
2. To add a new category:
   - Click **Add Category**
   - Enter name and description
   - Click **Save**
3. To edit a category:
   - Click the **Edit** button next to the category
   - Update information
   - Click **Save**

## Reservation Management

### Viewing Reservations

1. Navigate to **Reservation Management** in the admin sidebar
2. View all reservations in the system, filterable by:
   - Status (Pending, Approved, Rejected, Completed)
   - Date range
   - User
   - Equipment

### Processing Reservation Requests

1. In the Pending tab, review reservation requests
2. For each request, you can:
   - Click **View Details** to see full information
   - Click **Approve** to approve the reservation
   - Click **Reject** to deny the request
3. When approving or rejecting, you can add notes explaining your decision
4. The system will automatically notify the user of your decision

### Managing Active Reservations

1. In the Active tab, monitor currently active reservations
2. You can:
   - **Extend**: Grant additional time if requested
   - **Terminate Early**: End a reservation before its scheduled end date
   - **Report Issue**: Document any problems with the equipment

### Reservation Calendar

1. The calendar view provides a visual representation of all reservations
2. Use the filters to focus on specific equipment or time periods
3. Click on any reservation in the calendar to view details or take actions

## User Management

### Creating User Accounts

1. Navigate to **User Management** in the admin sidebar
2. Click **Add User**
3. Fill in the required information:
   - First Name
   - Last Name
   - Email
   - Phone Number
   - Role (User or Admin)
4. Click **Create User**
5. The system will send an email to the new user with instructions to set their password

### Managing User Roles

1. In User Management, find the user whose role you wish to modify
2. Click the **Edit** button
3. Change the role using the dropdown menu
4. Click **Save** to apply changes

### Deactivating User Accounts

1. To deactivate a user, find their account in User Management
2. Click the **Deactivate** button
3. Confirm the action
4. The user will no longer be able to log in, but their data remains in the system

## Team Management

### Creating Teams

1. Navigate to **Team Management** in the admin sidebar
2. Click **Create Team**
3. Enter the team name
4. Select a team leader from the dropdown
5. Add team members by searching for their names or emails
6. Click **Create Team** to save

### Managing Team Members

1. In Team Management, select the team you wish to modify
2. To add members:
   - Click **Add Members**
   - Search for users
   - Select users to add
   - Click **Add to Team**
3. To remove members:
   - Find the member in the team list
   - Click the **Remove** button
   - Confirm the action

### Team Reservations

1. Teams can make reservations as a unit
2. The team leader approves team reservation requests before they reach admin
3. As an admin, you can view which team a reservation belongs to in the reservation details

## Notification System

### System Notifications

1. Navigate to **Notifications** in the admin sidebar
2. View all system notifications
3. Filter by type, date, or status

### Creating Announcements

1. In the Notifications section, click **Create Announcement**
2. Select recipients:
   - All Users
   - Specific Users (search and select)
   - Specific Teams
3. Enter the announcement title and message
4. Set priority level (Normal, Important, Urgent)
5. Click **Send** to distribute the announcement

### Notification Settings

1. In System Settings, navigate to the **Notifications** tab
2. Configure:
   - Email notification settings
   - In-app notification settings
   - Notification retention period

## System Settings

### General Settings

1. Navigate to **System Settings** in the admin sidebar
2. In the General tab, configure:
   - System name and branding
   - Date and time formats
   - Default language

### Reservation Settings

1. In the Reservation tab, configure:
   - Maximum reservation duration
   - Advance booking period
   - Reservation approval requirements
   - Cancellation policy

### Security Settings

1. In the Security tab, configure:
   - Password policies
   - Session timeout
   - Login attempt limits
   - Two-factor authentication requirements

## Troubleshooting

### Common Issues

#### Reservation Conflicts
1. Check for overlapping reservations in the calendar view
2. Review the equipment status to ensure it's available
3. Verify that the user has the necessary permissions

#### Equipment Status Discrepancies
1. Check the equipment's maintenance history
2. Verify that all active reservations are properly recorded
3. Update the equipment status manually if necessary

#### User Access Problems
1. Verify the user's account status
2. Check their role and permissions
3. Reset their password if necessary

### Getting Help

For technical support:
1. Contact the system administrator at `support@labres.example.com`
2. Include detailed information about the issue
3. Attach screenshots if applicable
