-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('CARD', 'UPI', 'CASH');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "paymentMethod" "OrderPaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN "paymentRef" TEXT;
