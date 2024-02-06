/*
  Warnings:

  - Added the required column `phothUrl` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" ADD COLUMN     "phothUrl" TEXT NOT NULL;
