/*
  Warnings:

  - Added the required column `firstRoundStartAt` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "firstRoundStartAt" TIMESTAMP(3) NOT NULL;
