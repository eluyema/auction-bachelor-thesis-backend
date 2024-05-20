/*
  Warnings:

  - You are about to drop the column `auctionType` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `bidOptions` on the `Bid` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "auctionType";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "bidOptions",
ADD COLUMN     "coefficient" DOUBLE PRECISION,
ADD COLUMN     "days" INTEGER,
ADD COLUMN     "enteredPrice" BIGINT,
ADD COLUMN     "percent" DOUBLE PRECISION,
ADD COLUMN     "years" INTEGER;
