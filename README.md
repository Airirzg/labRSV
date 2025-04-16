# LabRES - Laboratory Equipment Reservation System

A modern web application for managing laboratory equipment reservations. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- User Authentication (Individual and Team-based)
- Equipment Management
- Reservation System
- Admin Dashboard
- Team Management
- Real-time Equipment Status
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Airirzg/LabRES.git
   cd LabRES
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/reservation_system?schema=public"
   JWT_SECRET="your-secret-key"
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

4. **Set up the database**
   ```bash
   # Create the database
   npx prisma db push

   # Generate Prisma Client
   npx prisma generate

   # Seed the database with initial data
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Users

After seeding the database, you can use these credentials to test the application:

1. **Admin User**
   - Email: admin@example.com
   - Password: admin123

2. **Regular User**
   - Email: john@example.com
   - Password: user123

3. **Team Leader**
   - Email: leader@example.com
   - Password: leader123

## Project Structure

- `/pages` - Next.js pages and API routes
- `/components` - Reusable React components
- `/context` - React context providers
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/styles` - CSS and styling files
- `/lib` - Utility functions and shared code
- `/types` - TypeScript type definitions

## Technologies Used

- **Frontend**
  - Next.js
  - React
  - TypeScript
  - Bootstrap
  - React Context for state management

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL
  - JSON Web Tokens (JWT)
  - bcryptjs for password hashing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
