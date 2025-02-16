# LabRES - Laboratory Reservation System

## Project Structure and File Relationships

### 1. Core Application Structure
```
LabRES-main/
├── pages/                 # Routes and API endpoints
│   ├── admin/            # Admin dashboard and management
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── equipment/        # Equipment catalog
│   └── reservations/     # Reservation management
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   └── home/            # Homepage components
├── prisma/              # Database schema and migrations
├── context/             # React context providers
├── lib/                 # Core libraries
├── middleware/          # Authentication middleware
├── store/               # Redux store and slices
├── utils/               # Helper functions
└── public/              # Static assets
```

### 2. Key Features and Components

#### Authentication System
- **Context**: `context/AuthContext.tsx`
  - Manages user authentication state
  - Provides login/logout functionality
  - JWT token management
  - Role-based access control

#### Admin Features
- **Dashboard**: `pages/admin/dashboard.tsx`
  - Statistics and analytics
  - Equipment overview
  - Recent reservations
  
- **Equipment Management**: `components/admin/EquipmentManagement.tsx`
  - CRUD operations
  - Category management
  - Status tracking

- **Message System**: `components/admin/MessageManagement.tsx`
  - User messages
  - Reply functionality
  - Notification system

#### User Features
- **Profile**: `pages/dashboard/profile.tsx`
  - User information
  - Reservation history
  - Notifications
  
- **Equipment**: `pages/equipment/index.tsx`
  - Equipment catalog
  - Search and filters
  - Availability status

- **Reservations**: `pages/reservations/create.tsx`
  - Equipment booking
  - Date selection
  - Confirmation process

### 3. API Structure

#### Admin APIs
```
/api/admin/
├── equipment/          # Equipment management
├── messages/          # Message system
├── notifications/     # Notification handling
├── profile/          # Admin profile
├── reservations/     # Reservation management
└── users/            # User management
```

#### Public APIs
```
/api/
├── auth/             # Authentication endpoints
├── equipment/        # Public equipment endpoints
├── notifications/    # User notifications
└── reservations/    # Reservation endpoints
```

### 4. Component Structure

#### Shared Components
```
components/
├── ErrorBoundary.tsx    # Error handling
├── ErrorMessage.tsx     # Error display
├── Footer.tsx          # Global footer
├── Loading.tsx         # Loading states
├── Navbar.tsx          # Navigation
├── ProfileForm.tsx     # Profile editing
├── ReservationForm.tsx # Reservation creation
└── SearchSidebar.tsx   # Search interface
```

#### Admin Components
```
components/admin/
├── CategoryModal.tsx         # Category management
├── EquipmentManagement.tsx  # Equipment CRUD
├── MessageManagement.tsx    # Message handling
├── ReservationManagement.tsx # Reservation management
└── UserManagement.tsx       # User administration
```

### 5. Utility Functions

#### Core Utilities
```
utils/
├── api.ts           # API helpers
├── auth.ts          # Authentication utilities
├── email.ts         # Email functionality
├── notifications.ts # Notification system
├── s3.ts           # File storage
└── sse.ts          # Server-sent events
```

### 6. State Management

#### Redux Store
```
store/
├── slices/          # Redux slices
│   ├── authSlice.ts    # Authentication state
│   └── reservationSlice.ts # Reservation state
└── store.ts         # Store configuration
```

### 7. Real-time Features

#### Notification System
- **Server**: `utils/notifications.ts`
  - Creates notifications
  - Manages notification state
  - Sends real-time updates

- **Client**: `pages/dashboard/profile.tsx`
  - Displays notifications
  - Handles real-time updates
  - Manages notification state

#### Server-Sent Events
- **Manager**: `utils/sse.ts`
  - Manages SSE connections
  - Handles event dispatch
  - Connection recovery

### 8. Data Flow Examples

#### Message Reply Flow
```
components/admin/MessageManagement.tsx
        ↓
pages/api/admin/messages/reply.ts
        ↓
utils/notifications.ts (Create notification)
        ↓
utils/sse.ts (Send real-time update)
        ↓
pages/dashboard/profile.tsx (Update UI)
```

#### Reservation Flow
```
pages/reservations/create.tsx
        ↓
components/ReservationForm.tsx
        ↓
pages/api/reservations/index.ts
        ↓
utils/notifications.ts (Notify admin)
        ↓
components/admin/ReservationManagement.tsx
```

### 9. Security Features

#### Authentication
- JWT-based authentication
- Role-based access control
- Secure password hashing
- Protected API routes

#### API Security
- Request validation with Zod
- CORS protection
- Rate limiting
- Error handling

### 10. Development Guidelines

#### Code Organization
- Feature-based component structure
- Shared utilities in utils/
- Type safety with TypeScript
- Consistent error handling

#### State Management
- Redux for global state
- React Context for auth
- Local state when appropriate
- SSE for real-time updates

#### Error Handling
- Global error boundary
- Consistent error responses
- Form validation
- Loading states

### 11. Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

### 12. Environment Setup
```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 13. File Relationships and Data Flow

#### Admin Dashboard Flow
```
pages/admin/dashboard.tsx
        ↓
components/admin/ReservationManagement.tsx
components/admin/EquipmentManagement.tsx
        ↓
api/admin/reservations/index.ts
api/admin/equipment/index.ts
api/admin/events.ts (SSE)
        ↓
lib/prisma.ts
        ↓
prisma/schema.prisma (Equipment & Reservation models)
```

#### Equipment Management Flow
```
pages/admin/equipment.tsx
        ↓
components/admin/EquipmentManagement.tsx
components/admin/CategoryModal.tsx
        ↓
api/admin/equipment/[id].ts
api/admin/equipment/index.ts
api/admin/categories/index.ts
        ↓
lib/prisma.ts
        ↓
prisma/schema.prisma (Equipment & Category models)
```

#### Reservation System Flow
```
pages/reservations/create.tsx
        ↓
components/ReservationForm.tsx
components/EquipmentTable.tsx
        ↓
api/reservations/index.ts
api/equipment/index.ts
        ↓
lib/prisma.ts
        ↓
prisma/schema.prisma (Reservation & Equipment models)
```

#### Authentication Flow
```
pages/_app.tsx
        ↓
context/AuthContext.tsx
middleware/auth.tsx
        ↓
api/auth/[...nextauth].ts
middleware/api-auth.ts
        ↓
lib/prisma.ts
        ↓
prisma/schema.prisma (User model)
```

#### Real-time Updates Flow
```
api/admin/events.ts (SSE Server)
        ↓
pages/admin/dashboard.tsx (SSE Client)
        ↓
components/admin/ReservationManagement.tsx
components/admin/EquipmentManagement.tsx
        ↓
Database Updates via Prisma
```

#### User Management Flow
```
pages/admin/users.tsx
        ↓
components/admin/UserManagement.tsx
components/ProfileForm.tsx
        ↓
api/admin/users/index.ts
api/admin/users/[id].ts
        ↓
lib/prisma.ts
        ↓
prisma/schema.prisma (User model)
```

#### Public Equipment Browsing Flow
```
pages/equipment/index.tsx
        ↓
components/EquipmentTable.tsx
components/SearchSidebar.tsx
        ↓
api/equipment/index.ts
api/equipment/[id].ts
        ↓
lib/prisma.ts
        ↓
prisma/schema.prisma (Equipment model)
```

### Key Dependencies Between Components:

1. **Dashboard Dependencies**:
   - ReservationManagement ↔ EquipmentManagement (shared state)
   - Dashboard ↔ Events API (real-time updates)
   - Statistics Cards ↔ Prisma Queries (data aggregation)

2. **Equipment Dependencies**:
   - EquipmentTable ↔ SearchSidebar (filtering)
   - EquipmentManagement ↔ CategoryModal (category assignment)
   - Equipment API ↔ Reservation API (availability checks)

3. **Reservation Dependencies**:
   - ReservationForm ↔ EquipmentTable (equipment selection)
   - Reservation API ↔ Equipment API (validation)
   - ReservationManagement ↔ Events API (status updates)

4. **Authentication Dependencies**:
   - AuthContext ↔ API Routes (token management)
   - Middleware ↔ AuthContext (route protection)
   - User API ↔ Auth API (profile management)

### Data Flow Patterns:

1. **UI Updates**:
   ```
   User Action → Component State → API Call → Database Update → SSE Event → UI Update
   ```

2. **Authentication**:
   ```
   Login Form → AuthContext → API Route → Token Generation → Local Storage → Protected Routes
   ```

3. **Real-time Updates**:
   ```
   Database Change → SSE Event → Client Listener → State Update → UI Refresh
   ```

4. **Form Submissions**:
   ```
   Form Component → Validation → API Call → Database Update → Response → UI Update
   ```

### 14. Database Schema

#### Equipment Model
```prisma
model Equipment {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      Status        @default(AVAILABLE)
  location    String
  categoryId  String
  category    Category      @relation(fields: [categoryId], references: [id])
  reservations Reservation[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

#### Reservation Model
```prisma
model Reservation {
  id          String      @id @default(cuid())
  userId      String
  equipmentId String
  startDate   DateTime
  endDate     DateTime
  status      ResStatus   @default(PENDING)
  user        User        @relation(fields: [userId], references: [id])
  equipment   Equipment   @relation(fields: [equipmentId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```
