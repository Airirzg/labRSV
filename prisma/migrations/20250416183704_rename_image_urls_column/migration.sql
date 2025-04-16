/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Equipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "imageUrls",
ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
