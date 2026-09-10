-- AlterEnum
ALTER TYPE "MatchStatus" ADD VALUE 'NON_INNOVATIVE';

-- AlterEnum
ALTER TYPE "ProblemStatus" ADD VALUE 'NON_INNOVATIVE';

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "non_innovative_count" INTEGER NOT NULL DEFAULT 0;
