-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'REMOVED');

-- CreateEnum
CREATE TYPE "SubmissionSource" AS ENUM ('REAL_USER', 'TEAM_TEST', 'SEED_DEMO');

-- CreateEnum
CREATE TYPE "FlagReason" AS ENUM ('WRONG_PRICE', 'OUTDATED', 'OTHER');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('LOADING', 'SUCCESS', 'EMPTY', 'VALIDATION_ERROR', 'AUTHENTICATION_ERROR', 'NETWORK_ERROR', 'SERVER_ERROR');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "local_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "approx_kg" DECIMAL(6,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_units" (
    "item_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,

    CONSTRAINT "item_units_pkey" PRIMARY KEY ("item_id","unit_id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_requests" (
    "id" TEXT NOT NULL,
    "proposed_name" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_market_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "note" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "SubmissionSource" NOT NULL DEFAULT 'REAL_USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flags" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "flagged_by_id" TEXT NOT NULL,
    "reason" "FlagReason" NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'PENDING',
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "client_event_id" TEXT,
    "name" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "screen_name" TEXT,
    "response_status" "ResponseStatus",
    "error_code" TEXT,
    "device_type" "DeviceType",
    "properties" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "items_name_key" ON "items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_label_key" ON "units"("label");

-- CreateIndex
CREATE UNIQUE INDEX "markets_name_lga_state_key" ON "markets"("name", "lga", "state");

-- CreateIndex
CREATE INDEX "idx_latest_price_per_market" ON "price_submissions"("item_id", "market_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_trend_lookup" ON "price_submissions"("item_id", "unit_id", "market_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "flags_submission_id_flagged_by_id_key" ON "flags"("submission_id", "flagged_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_events_client_event_id_key" ON "analytics_events"("client_event_id");

-- CreateIndex
CREATE INDEX "idx_kpi_event_counts" ON "analytics_events"("name", "created_at");

-- AddForeignKey
ALTER TABLE "item_units" ADD CONSTRAINT "item_units_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_units" ADD CONSTRAINT "item_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_requests" ADD CONSTRAINT "market_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_requests" ADD CONSTRAINT "market_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_requests" ADD CONSTRAINT "market_requests_created_market_id_fkey" FOREIGN KEY ("created_market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "price_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_flagged_by_id_fkey" FOREIGN KEY ("flagged_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
