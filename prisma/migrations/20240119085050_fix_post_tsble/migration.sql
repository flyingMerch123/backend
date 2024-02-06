/*
  Warnings:

  - The `fileId` column on the `post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `key` column on the `post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "fileId",
ADD COLUMN     "fileId" TEXT[],
DROP COLUMN "key",
ADD COLUMN     "key" TEXT[];
