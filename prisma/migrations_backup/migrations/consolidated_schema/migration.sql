-- Consolidated Migration File for Lab Reservation System
-- This file combines all migrations into a single file with comments for better maintainability

-- =============================================
-- Initial Schema Creation (20250211004341_init)
-- =============================================

-- User Management Tables
-- ---------------------

-- CreateTable: User - Stores information about system users
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Team - Represents groups of users who can make reservations together
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TeamMember - Junction table for users and teams (many-to-many)
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Client - Legacy table for external clients (may be deprecated)
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "entity" TEXT,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Admin - Legacy table for administrators (replaced by User with role=ADMIN)
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- Equipment Management Tables
-- --------------------------

-- CreateTable: Equipment - Stores information about laboratory equipment available for reservation
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "location" TEXT,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Category - Categories for organizing equipment
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Reservation System Tables
-- -----------------------

-- CreateTable: Reservation - Records equipment reservations by users or teams
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- Notification System Tables
-- -------------------------

-- CreateTable: Notification - System notifications for users
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Messaging System Tables
-- ---------------------

-- CreateTable: Message - Internal messaging system
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- Indexes and Unique Constraints
-- =============================================

-- User Management Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "TeamMember_userId_teamId_key" ON "TeamMember"("userId", "teamId");
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- Equipment Management Indexes
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Reservation System Indexes
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");
CREATE INDEX "Reservation_teamId_idx" ON "Reservation"("teamId");
CREATE INDEX "Reservation_equipmentId_idx" ON "Reservation"("equipmentId");
CREATE INDEX "Reservation_startDate_endDate_idx" ON "Reservation"("startDate", "endDate");

-- Messaging System Indexes
CREATE INDEX "Message_userId_idx" ON "Message"("userId");
CREATE INDEX "Message_parentId_idx" ON "Message"("parentId");

-- =============================================
-- Foreign Key Relationships
-- =============================================

-- Team Relationships
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Equipment Relationships
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reservation Relationships
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Notification Relationships
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Message Relationships
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================
-- Enum Types
-- =============================================

-- Role: User roles in the system
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- Status: Equipment status options
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'IN_USE');

-- ReservationStatus: Status options for reservations
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ONGOING', 'FINISHED');

-- NotificationType: Types of system notifications
CREATE TYPE "NotificationType" AS ENUM ('RESERVATION_UPDATE', 'EQUIPMENT_UPDATE', 'SYSTEM', 'MESSAGE');

-- MessageStatus: Status options for messages
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
