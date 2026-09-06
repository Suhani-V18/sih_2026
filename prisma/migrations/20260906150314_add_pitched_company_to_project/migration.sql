-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('RURAL', 'URBAN');

-- CreateEnum
CREATE TYPE "SubmitterType" AS ENUM ('CITIZEN', 'LOCAL_BODY');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('PANCHAYAT', 'MUNICIPAL_CORPORATION');

-- CreateEnum
CREATE TYPE "JurisdictionMatchStatus" AS ENUM ('MATCHED', 'UNMATCHED');

-- CreateEnum
CREATE TYPE "DescriptionType" AS ENUM ('AUDIO', 'TEXT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('PENDING', 'PENDING_REVIEW', 'VALIDATED', 'REJECTED', 'MERGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "CompanyIdType" AS ENUM ('GSTIN', 'CIN', 'UDYAM');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('ACCEPTED', 'GATE1_PROPOSAL', 'GATE2_PITCH', 'FUNDED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'FLAGGED', 'RELEASED');

-- CreateTable
CREATE TABLE "citizens" (
    "id" BIGSERIAL NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "trust_score" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citizens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_bodies" (
    "id" BIGSERIAL NOT NULL,
    "body_code" TEXT NOT NULL,
    "body_type" "BodyType" NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "block" TEXT,
    "ward" TEXT,
    "clerk_user_id" TEXT,
    "official_email" TEXT NOT NULL,
    "lgd_code" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registered_at" TIMESTAMP(3),
    "is_moderator" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_bodies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisdiction_directory" (
    "id" BIGSERIAL NOT NULL,
    "district" TEXT NOT NULL,
    "block" TEXT,
    "ward" TEXT,
    "body_type" "BodyType" NOT NULL,
    "fallback_email" TEXT NOT NULL,
    "source_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jurisdiction_directory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" BIGSERIAL NOT NULL,
    "problem_code" TEXT NOT NULL,
    "submitter_type" "SubmitterType" NOT NULL,
    "citizen_id" BIGINT,
    "submitted_by_body_id" BIGINT,
    "title" TEXT,
    "description_type" "DescriptionType" NOT NULL,
    "description_text" TEXT,
    "description_audio_url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "state" TEXT DEFAULT 'West Bengal',
    "district" TEXT NOT NULL,
    "area_type" "AreaType" DEFAULT 'URBAN',
    "block" TEXT,
    "ward" TEXT,
    "village" TEXT,
    "pincode" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "address_text" TEXT,
    "jurisdiction_match_status" "JurisdictionMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matched_body_id" BIGINT,
    "ai_category" TEXT,
    "ai_severity" INTEGER,
    "ai_confidence" DECIMAL(5,4),
    "needs_moderator_review" BOOLEAN NOT NULL DEFAULT false,
    "merged_into_problem_id" BIGINT,
    "status" "ProblemStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisdiction_notifications" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "notified_email" TEXT NOT NULL,
    "notified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jurisdiction_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_media" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" BIGSERIAL NOT NULL,
    "university_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email_domain" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "official_email" TEXT NOT NULL,
    "registration_number" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registered_at" TIMESTAMP(3),
    "trust_score" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_departments" (
    "id" BIGSERIAL NOT NULL,
    "university_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "expertise_area" TEXT NOT NULL,
    "specialty_count" INTEGER NOT NULL DEFAULT 0,
    "active_projects" INTEGER NOT NULL DEFAULT 0,
    "successful_projects" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_members" (
    "id" BIGSERIAL NOT NULL,
    "university_id" BIGINT NOT NULL,
    "department_id" BIGINT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" BIGSERIAL NOT NULL,
    "company_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT NOT NULL,
    "successful_projects" INTEGER NOT NULL DEFAULT 0,
    "clerk_user_id" TEXT,
    "official_email" TEXT NOT NULL,
    "company_id_type" "CompanyIdType",
    "company_id_value" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registered_at" TIMESTAMP(3),
    "trust_score" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_university_matches" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "university_id" BIGINT NOT NULL,
    "department_id" BIGINT,
    "match_score" DECIMAL(5,4) NOT NULL,
    "match_reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MatchStatus" NOT NULL DEFAULT 'SUGGESTED',
    "suggested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "problem_university_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_company_matches" (
    "id" BIGSERIAL NOT NULL,
    "university_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "match_score" DECIMAL(5,4) NOT NULL,
    "match_reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MatchStatus" NOT NULL DEFAULT 'SUGGESTED',
    "suggested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "university_company_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "university_id" BIGINT NOT NULL,
    "department_id" BIGINT,
    "pitched_company_id" BIGINT,
    "stage" "ProjectStage" NOT NULL DEFAULT 'ACCEPTED',
    "proposal_text" TEXT,
    "budget_estimate" DECIMAL(65,30),
    "pitch_deck_url" TEXT,
    "pitch_video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "order_index" INTEGER NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "proof_url" TEXT,
    "mentor_signed_off" BOOLEAN NOT NULL DEFAULT false,
    "company_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_funding" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "total_committed" DECIMAL(65,30) NOT NULL,
    "released_so_far" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_funding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_comments" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "author_clerk_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "citizens_clerk_user_id_key" ON "citizens"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "local_bodies_body_code_key" ON "local_bodies"("body_code");

-- CreateIndex
CREATE UNIQUE INDEX "local_bodies_clerk_user_id_key" ON "local_bodies"("clerk_user_id");

-- CreateIndex
CREATE INDEX "local_bodies_district_block_ward_idx" ON "local_bodies"("district", "block", "ward");

-- CreateIndex
CREATE UNIQUE INDEX "jurisdiction_directory_district_block_ward_body_type_key" ON "jurisdiction_directory"("district", "block", "ward", "body_type");

-- CreateIndex
CREATE UNIQUE INDEX "problems_problem_code_key" ON "problems"("problem_code");

-- CreateIndex
CREATE INDEX "problems_status_idx" ON "problems"("status");

-- CreateIndex
CREATE INDEX "problems_matched_body_id_idx" ON "problems"("matched_body_id");

-- CreateIndex
CREATE INDEX "problems_district_block_ward_idx" ON "problems"("district", "block", "ward");

-- CreateIndex
CREATE INDEX "problems_citizen_id_idx" ON "problems"("citizen_id");

-- CreateIndex
CREATE INDEX "problems_submitted_by_body_id_idx" ON "problems"("submitted_by_body_id");

-- CreateIndex
CREATE INDEX "problems_needs_moderator_review_idx" ON "problems"("needs_moderator_review");

-- CreateIndex
CREATE INDEX "jurisdiction_notifications_problem_id_idx" ON "jurisdiction_notifications"("problem_id");

-- CreateIndex
CREATE INDEX "problem_media_problem_id_idx" ON "problem_media"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "universities_university_code_key" ON "universities"("university_code");

-- CreateIndex
CREATE UNIQUE INDEX "universities_email_domain_key" ON "universities"("email_domain");

-- CreateIndex
CREATE INDEX "university_departments_university_id_idx" ON "university_departments"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "university_departments_university_id_name_key" ON "university_departments"("university_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "university_members_clerk_user_id_key" ON "university_members"("clerk_user_id");

-- CreateIndex
CREATE INDEX "university_members_university_id_idx" ON "university_members"("university_id");

-- CreateIndex
CREATE INDEX "university_members_department_id_idx" ON "university_members"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_code_key" ON "companies"("company_code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_clerk_user_id_key" ON "companies"("clerk_user_id");

-- CreateIndex
CREATE INDEX "companies_region_idx" ON "companies"("region");

-- CreateIndex
CREATE INDEX "problem_university_matches_problem_id_idx" ON "problem_university_matches"("problem_id");

-- CreateIndex
CREATE INDEX "problem_university_matches_university_id_idx" ON "problem_university_matches"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_university_matches_problem_id_university_id_key" ON "problem_university_matches"("problem_id", "university_id");

-- CreateIndex
CREATE INDEX "university_company_matches_university_id_idx" ON "university_company_matches"("university_id");

-- CreateIndex
CREATE INDEX "university_company_matches_company_id_idx" ON "university_company_matches"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "university_company_matches_university_id_company_id_key" ON "university_company_matches"("university_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_problem_id_key" ON "projects"("problem_id");

-- CreateIndex
CREATE INDEX "projects_university_id_idx" ON "projects"("university_id");

-- CreateIndex
CREATE INDEX "projects_pitched_company_id_idx" ON "projects"("pitched_company_id");

-- CreateIndex
CREATE INDEX "milestones_project_id_idx" ON "milestones"("project_id");

-- CreateIndex
CREATE INDEX "project_funding_project_id_idx" ON "project_funding"("project_id");

-- CreateIndex
CREATE INDEX "project_funding_company_id_idx" ON "project_funding"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_funding_project_id_company_id_key" ON "project_funding"("project_id", "company_id");

-- CreateIndex
CREATE INDEX "project_comments_project_id_idx" ON "project_comments"("project_id");

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "citizens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_submitted_by_body_id_fkey" FOREIGN KEY ("submitted_by_body_id") REFERENCES "local_bodies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_matched_body_id_fkey" FOREIGN KEY ("matched_body_id") REFERENCES "local_bodies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_merged_into_problem_id_fkey" FOREIGN KEY ("merged_into_problem_id") REFERENCES "problems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jurisdiction_notifications" ADD CONSTRAINT "jurisdiction_notifications_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_media" ADD CONSTRAINT "problem_media_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_departments" ADD CONSTRAINT "university_departments_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_members" ADD CONSTRAINT "university_members_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_members" ADD CONSTRAINT "university_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "university_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_university_matches" ADD CONSTRAINT "problem_university_matches_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_university_matches" ADD CONSTRAINT "problem_university_matches_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_university_matches" ADD CONSTRAINT "problem_university_matches_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "university_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_company_matches" ADD CONSTRAINT "university_company_matches_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_company_matches" ADD CONSTRAINT "university_company_matches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "university_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_pitched_company_id_fkey" FOREIGN KEY ("pitched_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_funding" ADD CONSTRAINT "project_funding_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_funding" ADD CONSTRAINT "project_funding_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
