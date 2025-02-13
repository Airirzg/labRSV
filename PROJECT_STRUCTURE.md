# LabRES - Laboratory Reservation System

## Project Structure and File Relationships

### 1. Core Application Structure
```
LabRES-main/
├── pages/         # Routes and API endpoints
├── components/    # Reusable UI components
├── prisma/       # Database schema and migrations
├── context/      # React context providers
├── store/        # State management (Redux)
├── lib/          # Utility libraries
├── utils/        # Helper functions
└── public/       # Static assets
```

### 2. Database Models

#### Equipment Model
- `id`: Unique identifier
- `name`: Name of the equipment
- `description`: Description of the equipment
- `imageUrl`: URL to equipment image
- `status`: AVAILABLE, MAINTENANCE, or IN_USE
- `location`: Location of the equipment
- `categoryId`: Links to a category
- `availability`: Boolean flag for availability

#### Reservation Model
- `id`: Unique identifier
- `userId`: User making the reservation (optional)
- `teamId`: Team making the reservation (optional)
- `equipmentId`: Equipment being reserved
- `startDate`: Start time of reservation
- `endDate`: End time of reservation
- `status`: PENDING, APPROVED, REJECTED, ONGOING, or FINISHED

#### User Roles
- `USER`: Regular users who can make reservations
- `ADMIN`: Administrators who can manage equipment and reservations

### 3. Directory Structure Details

#### Pages Directory (`/pages`)
- `_app.tsx`: Root component that wraps all pages
- `index.tsx`: Homepage
- `/api/*`: Backend API endpoints
- `/admin/*`: Admin dashboard pages
- `/auth/*`: Authentication pages
- `/equipment/*`: Equipment management pages
- `/reservations/*`: Reservation management pages

#### Components Directory (`/components`)
##### Shared Components
- `Navbar.tsx`: Global navigation
- `Footer.tsx`: Global footer
- `Loading.tsx`: Loading state component
- `ErrorMessage.tsx`: Error display component
- `SearchSidebar.tsx`: Filtering sidebar

##### Feature-specific Components
- `EquipmentTable.tsx`: Equipment listing
- `ReservationForm.tsx`: Reservation creation/editing
- `ProfileForm.tsx`: User profile management

### 4. Data Flow Relationships

#### Frontend to Backend Flow
```
pages/equipment/index.tsx
        ↓
api/equipment/index.ts
        ↓
prisma/schema.prisma
```

#### Authentication Flow
```
components/Navbar.tsx
        ↓
context/AuthContext.tsx
        ↓
pages/api/auth/[...nextauth].ts
```

#### State Management
```
store/
├── slices/        # Redux slices for different features
└── index.ts       # Root store configuration
```

### 5. API Structure (`/pages/api`)
- `/admin/*`: Administrative endpoints
- `/auth/*`: Authentication endpoints
- `/equipment/*`: Equipment management
- `/reservations/*`: Reservation handling
- `/users/*`: User management

### 6. Database Management (`/prisma`)
```
prisma/
├── schema.prisma      # Database schema
├── migrations/        # Database migrations
└── seed.ts           # Seed data
```

### 7. Key File Dependencies

#### Equipment Management Flow
```
pages/equipment/index.tsx
        ↓
components/EquipmentTable.tsx
        ↓
api/equipment/[id].ts
        ↓
prisma/schema.prisma (Equipment model)
```

#### Reservation Flow
```
pages/reservations/create.tsx
        ↓
components/ReservationForm.tsx
        ↓
api/reservations/index.ts
        ↓
prisma/schema.prisma (Reservation model)
```

#### Authentication Flow
```
pages/auth/login.tsx
        ↓
context/AuthContext.tsx
        ↓
api/auth/[...nextauth].ts
        ↓
prisma/schema.prisma (User model)
```

### 8. Technologies Used
- Next.js: React framework for routing and API
- Prisma: Database ORM
- PostgreSQL: Database
- Redux: State management
- NextAuth.js: Authentication
- TypeScript: Type safety
- React: UI library

### 9. Features
1. Equipment Management
   - Browse equipment
   - Filter by category
   - Search functionality
   - Availability tracking

2. Reservation System
   - Create reservations
   - Manage bookings
   - Team-based reservations
   - Status tracking

3. User Management
   - Authentication
   - Role-based access
   - Profile management
   - Team management

4. Notification System
   - Reservation updates
   - Equipment status changes
   - System notifications

### 10. Development Guidelines
1. File Naming:
   - Use PascalCase for components
   - Use camelCase for utilities and hooks
   - Use kebab-case for CSS files

2. Code Organization:
   - Keep components modular
   - Use TypeScript interfaces
   - Follow Next.js conventions
   - Implement proper error handling

3. State Management:
   - Use Redux for global state
   - Use React Context for auth
   - Use local state for component-specific data

4. API Guidelines:
   - RESTful endpoints
   - Proper error responses
   - Input validation
   - Authentication middleware

### 11. Environment Setup
Required environment variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
```

### 12. Getting Started
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
