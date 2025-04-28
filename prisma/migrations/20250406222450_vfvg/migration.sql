/*
  Warnings:

  - Added the required column `dataHash` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordType` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HealthRecordType" AS ENUM ('FILE', 'FORM');

-- AlterTable
ALTER TABLE "HealthRecord" ADD COLUMN     "dataHash" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "recordType" "HealthRecordType" NOT NULL;
