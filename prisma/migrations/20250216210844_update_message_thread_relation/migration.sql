/*
  Warnings:

  - You are about to drop the column `replyToId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_replyToId_fkey";

-- DropIndex
DROP INDEX "Message_replyToId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "replyToId",
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Message_parentId_idx" ON "Message"("parentId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
