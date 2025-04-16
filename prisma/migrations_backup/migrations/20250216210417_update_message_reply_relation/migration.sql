/*
  Warnings:

  - You are about to drop the column `inReplyTo` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_inReplyTo_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "inReplyTo",
ADD COLUMN     "replyToId" TEXT;

-- CreateIndex
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
