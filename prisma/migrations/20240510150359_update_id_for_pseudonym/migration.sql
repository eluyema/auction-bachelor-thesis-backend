/*
  Warnings:

  - The primary key for the `Pseudonym` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Pseudonym` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pseudonym" DROP CONSTRAINT "Pseudonym_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Pseudonym_pkey" PRIMARY KEY ("userId", "auctionId");
