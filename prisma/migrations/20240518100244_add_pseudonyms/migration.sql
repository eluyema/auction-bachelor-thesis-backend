/*
  Warnings:

  - You are about to drop the column `auctionOptions` on the `Auction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "auctionOptions";

-- CreateTable
CREATE TABLE "Pseudonym" (
    "userId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Pseudonym_pkey" PRIMARY KEY ("userId","auctionId")
);

-- AddForeignKey
ALTER TABLE "Pseudonym" ADD CONSTRAINT "Pseudonym_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pseudonym" ADD CONSTRAINT "Pseudonym_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
