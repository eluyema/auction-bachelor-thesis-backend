/*
  Warnings:

  - You are about to drop the column `userId` on the `Round` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_userId_fkey";

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "userId";
