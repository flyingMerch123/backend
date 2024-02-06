/*
  Warnings:

  - You are about to drop the column `phothUrl` on the `post` table. All the data in the column will be lost.
  - Added the required column `photoUrl` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "phothUrl",
ADD COLUMN     "photoUrl" TEXT NOT NULL;
