/*
  Warnings:

  - Added the required column `recordName` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordSize` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthRecord" ADD COLUMN     "recordName" TEXT NOT NULL,
ADD COLUMN     "recordSize" INTEGER NOT NULL;
