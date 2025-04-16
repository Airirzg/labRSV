-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "inReplyTo" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_inReplyTo_fkey" FOREIGN KEY ("inReplyTo") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
