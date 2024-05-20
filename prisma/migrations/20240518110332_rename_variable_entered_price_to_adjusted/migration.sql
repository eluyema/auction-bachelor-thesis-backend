/*
  Warnings:

  - You are about to drop the column `enteredPrice` on the `Bid` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "enteredPrice",
ADD COLUMN     "adjustedPrice" BIGINT;
