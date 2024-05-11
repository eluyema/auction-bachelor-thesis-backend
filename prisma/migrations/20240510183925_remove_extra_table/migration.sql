/*
  Warnings:

  - You are about to drop the `Pseudonym` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pseudonym" DROP CONSTRAINT "Pseudonym_auctionId_fkey";

-- DropForeignKey
ALTER TABLE "Pseudonym" DROP CONSTRAINT "Pseudonym_userId_fkey";

-- DropTable
DROP TABLE "Pseudonym";
