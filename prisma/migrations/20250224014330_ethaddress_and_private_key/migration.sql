/*
  Warnings:

  - A unique constraint covering the columns `[ethereumAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[encryptedPrivateKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `encryptedPrivateKey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ethereumAddress` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encryptedPrivateKey" TEXT NOT NULL,
ADD COLUMN     "ethereumAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_ethereumAddress_key" ON "User"("ethereumAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_encryptedPrivateKey_key" ON "User"("encryptedPrivateKey");
