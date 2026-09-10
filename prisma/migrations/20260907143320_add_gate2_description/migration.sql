-- CreateEnum
CREATE TYPE "PitchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "gate2_description" TEXT;

-- CreateTable
CREATE TABLE "project_pitches" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "match_score" DECIMAL(5,4),
    "match_reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "PitchStatus" NOT NULL DEFAULT 'PENDING',
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pitches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_pitches_project_id_idx" ON "project_pitches"("project_id");

-- CreateIndex
CREATE INDEX "project_pitches_company_id_idx" ON "project_pitches"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_pitches_project_id_company_id_key" ON "project_pitches"("project_id", "company_id");

-- AddForeignKey
ALTER TABLE "project_pitches" ADD CONSTRAINT "project_pitches_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_pitches" ADD CONSTRAINT "project_pitches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
