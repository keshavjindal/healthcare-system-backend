-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "paymentStatus" DROP DEFAULT,
ALTER COLUMN "paymentMethod" DROP DEFAULT,
ALTER COLUMN "amount" DROP DEFAULT;
