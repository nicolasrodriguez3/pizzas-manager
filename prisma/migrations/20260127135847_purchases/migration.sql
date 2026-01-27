/*
  Warnings:

  - You are about to drop the column `invoiceNumber` on the `IngredientPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `IngredientPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `IngredientPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `supplierName` on the `IngredientPurchase` table. All the data in the column will be lost.
  - Added the required column `purchaseId` to the `IngredientPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IngredientPurchase_purchaseDate_idx";

-- AlterTable
ALTER TABLE "IngredientPurchase" DROP COLUMN "invoiceNumber",
DROP COLUMN "notes",
DROP COLUMN "purchaseDate",
DROP COLUMN "supplierName",
ADD COLUMN     "purchaseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceNumber" TEXT,
    "supplierName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Purchase_organizationId_idx" ON "Purchase"("organizationId");

-- CreateIndex
CREATE INDEX "Purchase_purchaseDate_idx" ON "Purchase"("purchaseDate");

-- CreateIndex
CREATE INDEX "IngredientPurchase_purchaseId_idx" ON "IngredientPurchase"("purchaseId");

-- AddForeignKey
ALTER TABLE "IngredientPurchase" ADD CONSTRAINT "IngredientPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
