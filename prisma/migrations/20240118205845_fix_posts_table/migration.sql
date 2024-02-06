/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `post` table. All the data in the column will be lost.
  - Added the required column `fileId` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "photoUrl",
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL;
