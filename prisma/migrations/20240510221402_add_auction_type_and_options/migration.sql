-- CreateEnum
CREATE TYPE "AuctionType" AS ENUM ('DEFAULT', 'NON_PRICE_CRITERIA', 'ESCO');

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "auctionOptions" TEXT,
ADD COLUMN     "auctionType" "AuctionType" NOT NULL DEFAULT 'DEFAULT';
