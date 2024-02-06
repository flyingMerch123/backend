/*
  Warnings:

  - The primary key for the `post_image` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "post_image" DROP CONSTRAINT "post_image_pkey",
ADD CONSTRAINT "post_image_pkey" PRIMARY KEY ("fileId");
