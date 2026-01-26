-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('ELABORADO', 'REVENTA', 'OTHER');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('COMPRA', 'AJUSTE', 'RETIRO', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT');

-- AlterTable "OrganizationMember"
ALTER TABLE "OrganizationMember" 
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "Role" USING "role"::"Role",
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- AlterTable "Product"
ALTER TABLE "Product" 
ALTER COLUMN "type" TYPE "ProductType" USING "type"::"ProductType";

-- AlterTable "StockMovement"
ALTER TABLE "StockMovement" 
ALTER COLUMN "type" TYPE "StockMovementType" USING "type"::"StockMovementType",
ALTER COLUMN "referenceType" TYPE "ReferenceType" USING "referenceType"::"ReferenceType";

-- Add Index for Product type if it didn't exist (Prisma generated it in its migration)
-- CREATE INDEX "Product_type_idx" ON "Product"("type");
-- CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");
