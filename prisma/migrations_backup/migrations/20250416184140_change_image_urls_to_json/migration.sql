/*
  Warnings:

  - You are about to drop the column `image_urls` on the `Equipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "image_urls",
ADD COLUMN     "imageUrls" JSONB DEFAULT '[]';
