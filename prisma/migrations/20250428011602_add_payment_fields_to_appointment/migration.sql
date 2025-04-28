/*
  Warnings:

  - Added the required column `amount` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'POINTS');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 500;
