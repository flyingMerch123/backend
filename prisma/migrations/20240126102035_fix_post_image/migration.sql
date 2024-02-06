/*
  Warnings:

  - You are about to drop the column `createdAt` on the `post_image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post_image" DROP COLUMN "createdAt",
ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 1;
