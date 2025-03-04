/*
  Warnings:

  - Added the required column `recordData` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthRecord" ADD COLUMN     "recordData" BYTEA NOT NULL;
