/*
  Warnings:

  - You are about to drop the column `encryptedPrivateKey` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[encryptedJSON]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `encryptedJSON` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_encryptedPrivateKey_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "encryptedPrivateKey",
ADD COLUMN     "encryptedJSON" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_encryptedJSON_key" ON "User"("encryptedJSON");
