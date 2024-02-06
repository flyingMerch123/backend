/*
  Warnings:

  - You are about to drop the column `fileId` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "fileId",
DROP COLUMN "key";

-- CreateTable
CREATE TABLE "post_image" (
    "postId" UUID NOT NULL,
    "fileId" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "post_image_pkey" PRIMARY KEY ("postId")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_image_fileId_key_key" ON "post_image"("fileId", "key");

-- AddForeignKey
ALTER TABLE "post_image" ADD CONSTRAINT "post_image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
