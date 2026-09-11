/*
  Warnings:

  - The `status` column on the `problem_university_matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `university_company_matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProblemMatchStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'REJECTED', 'NON_INNOVATIVE');

-- CreateEnum
CREATE TYPE "CompanyMatchStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "problem_university_matches" DROP COLUMN "status",
ADD COLUMN     "status" "ProblemMatchStatus" NOT NULL DEFAULT 'SUGGESTED';

-- AlterTable
ALTER TABLE "university_company_matches" DROP COLUMN "status",
ADD COLUMN     "status" "CompanyMatchStatus" NOT NULL DEFAULT 'SUGGESTED';

-- DropEnum
DROP TYPE "MatchStatus";
