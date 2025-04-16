# LabRES Application Hierarchy

## 1. Frontend Structure

### Pages
```
/pages
├── admin/                  # Admin dashboard pages
│   ├── dashboard.tsx       # Main admin dashboard
│   ├── equipment.tsx       # Equipment management
│   ├── messages.tsx       # Message management
│   └── reservations.tsx   # Reservation management
│
├── auth/                   # Authentication pages
│   ├── login.tsx          # Login page
│   └── register.tsx       # Registration page
│
├── dashboard/             # User dashboard pages
│   ├── index.tsx         # Main user dashboard
│   └── profile.tsx       # User profile management
│
├── equipment/            # Equipment related pages
│   └── index.tsx        # Equipment listing and search
│
├── reservations/        # Reservation pages
│   ├── create.tsx      # Create new reservation
│   └── [id].tsx       # View/edit specific reservation
│
└── index.tsx           # Home page
```

### Components
```
/components
├── admin/              # Admin-specific components
│   ├── EquipmentManagement.tsx
│   ├── MessageManagement.tsx
│   └── ReservationManagement.tsx
│
├── common/            # Shared components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Modal.tsx
│
├── layout/           # Layout components
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Layout.tsx
│   └── Navbar.tsx
│
└── ui/              # UI components
    ├── Calendar.tsx
    ├── Loading.tsx
    ├── Notification.tsx
    └── SearchSidebar.tsx
```

## 2. Backend Structure

### API Routes
```
/pages/api
├── admin/                 # Admin endpoints
│   ├── equipment/
│   │   ├── [id].ts
│   │   └── index.ts
│   ├── messages/
│   │   ├── reply.ts
│   │   └── index.ts
│   └── reservations/
│       ├── [id].ts
│       └── index.ts
│
├── auth/                 # Authentication endpoints
│   ├── login.ts
│   └── register.ts
│
├── equipment/           # Equipment endpoints
│   ├── [id].ts
│   └── index.ts
│
├── notifications/      # Notification endpoints
│   └── index.ts
│
└── reservations/      # Reservation endpoints
    ├── [id].ts
    └── index.ts
```

### Database
```
/prisma
├── migrations/        # Database migrations
├── schema.prisma     # Database schema
└── seed.ts          # Seed data
```

## 3. Core Infrastructure

### Configuration
```
/
├── .env              # Environment variables
├── next.config.js    # Next.js configuration
├── package.json      # Dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

### Utilities and Middleware
```
/lib
├── prisma.ts        # Prisma client instance
└── utils/
    ├── auth.ts      # Authentication utilities
    ├── date.ts      # Date handling
    └── validation.ts # Input validation

/middleware
├── api-auth.ts      # API authentication
└── withAuth.ts      # Route protection
```

### Context and State Management
```
/context
├── AuthContext.tsx   # Authentication context
└── UIContext.tsx    # UI state context

/hooks
├── useAuth.ts       # Authentication hook
├── useNotification.ts # Notification hook
└── useReservation.ts # Reservation hook
```

## 4. Assets and Styles
```
/public
├── images/          # Static images
└── icons/           # Icon assets

/styles
├── globals.scss     # Global styles
└── components/      # Component-specific styles
```

## 5. Type Definitions
```
/types
├── auth.ts         # Authentication types
├── equipment.ts    # Equipment types
├── reservation.ts  # Reservation types
└── user.ts        # User types
```

## Key Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Protected routes

2. **Equipment Management**
   - Equipment listing
   - Category filtering
   - Availability tracking
   - Image uploads

3. **Reservation System**
   - Calendar-based booking
   - Conflict prevention
   - Status tracking
   - Team reservations

4. **Communication**
   - Message system
   - Notifications
   - Email alerts

5. **Admin Features**
   - Dashboard analytics
   - User management
   - Equipment management
   - Reservation approval

## Technology Stack

- **Frontend**: Next.js, TypeScript, React
- **Backend**: Node.js (Next.js API routes)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Storage**: AWS S3
- **Email**: SendGrid
- **Styling**: Bootstrap, SCSS
- **State Management**: Context API + Hooks

## Programming Languages and Technologies

### Primary Languages
```
- TypeScript (*.ts, *.tsx)
  ├── Frontend Components
  ├── API Routes
  ├── Type Definitions
  └── Utility Functions

- HTML/JSX (in *.tsx files)
  ├── Component Templates
  ├── Page Layouts
  └── Markup Structure

- JavaScript (*.js)
  ├── Configuration Files
  └── Build Scripts

- SQL
  ├── Database Migrations
  ├── Seed Data
  └── Custom Queries

- SCSS/CSS (*.scss, *.css)
  ├── Global Styles
  ├── Component Styles
  └── Theme Variables
```

### Configuration Languages
```
- JSON (*.json)
  ├── package.json
  ├── tsconfig.json
  └── Configuration Files

- Prisma Schema (*.prisma)
  └── Database Models & Relations

- Environment Files (.env)
  └── Environment Variables

- Markdown (*.md)
  ├── Documentation
  └── README Files
```

### File Distribution
- TypeScript/TSX: ~70%
- SCSS/CSS: ~15%
- SQL: ~8%
- JSON/Config: ~5%
- Others: ~2%

## Database Relations

### Core Tables and Their Relationships

1. **User Relations**
```
User
├── 1:N → Notifications (One user can have many notifications)
├── 1:N → Reservations (One user can make many reservations)
├── 1:N → Messages (One user can have many messages)
└── 1:N → TeamMembers (One user can be in many teams)
```

2. **Team Relations**
```
Team
├── 1:N → TeamMembers (One team can have many members)
└── 1:N → Reservations (One team can have many reservations)
```

3. **Equipment Relations**
```
Equipment
├── N:1 → Category (Many equipment belong to one category)
└── 1:N → Reservations (One equipment can have many reservations)
```

4. **Message Relations**
```
Message
├── N:1 → User (Many messages can belong to one user)
└── 1:N → Message (Self-referential: one message can have many replies)
```

### Key Relationships Explained

1. **User-Team Relationship**
   - Users can be part of multiple teams (M:N relationship)
   - Implemented through the TeamMember junction table
   - Each team has one leader (userId in Team table)

2. **Reservation System**
   - Reservations link Users, Teams, and Equipment
   - One reservation belongs to:
     * One User (required)
     * One Equipment (required)
     * One Team (optional)
   - Indexed for efficient querying by date ranges

3. **Equipment Management**
   - Equipment are categorized (N:1 with Category)
   - Track availability and status
   - Soft delete support (isDeleted flag)

4. **Notification System**
   - Direct link to users (N:1)
   - Different types: RESERVATION_UPDATE, EQUIPMENT_UPDATE, SYSTEM, MESSAGE
   - Read status tracking

5. **Messaging System**
   - Hierarchical structure (self-referential)
   - Messages can have parent/child relationships
   - Tracks read/unread status
   - Optional user association for system messages

### Database Constraints
```
Unique Constraints:
├── User.email
├── Category.name
└── TeamMember[userId, teamId]

Indexes:
├── Reservation[userId, teamId, equipmentId]
├── Reservation[startDate, endDate]
├── Message[userId]
└── Message[parentId]
