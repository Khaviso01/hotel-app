/*
  Warnings:

  - You are about to drop the column `comment` on the `Review` table. All the data in the column will be lost.
  - Added the required column `text` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "reference" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "comment",
ADD COLUMN     "text" TEXT NOT NULL;
