-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_auctionId_fkey";

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
