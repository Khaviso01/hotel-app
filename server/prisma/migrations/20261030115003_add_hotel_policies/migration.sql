-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "policies" TEXT[] DEFAULT ARRAY[]::TEXT[];
