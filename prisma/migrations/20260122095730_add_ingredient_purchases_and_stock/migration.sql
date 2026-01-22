/*
  Warnings:

  - You are about to drop the column `cost` on the `Ingredient` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "IngredientPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceNumber" TEXT,
    "supplierName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IngredientPurchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IngredientPurchase_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "reason" TEXT,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "movementDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "minStock" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ingredient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ingredient" ("createdAt", "description", "id", "isActive", "name", "organizationId", "unit", "updatedAt", "userId") SELECT "createdAt", "description", "id", "isActive", "name", "organizationId", "unit", "updatedAt", "userId" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE INDEX "Ingredient_name_idx" ON "Ingredient"("name");
CREATE INDEX "Ingredient_isActive_idx" ON "Ingredient"("isActive");
CREATE INDEX "Ingredient_userId_idx" ON "Ingredient"("userId");
CREATE INDEX "Ingredient_organizationId_idx" ON "Ingredient"("organizationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "IngredientPurchase_organizationId_idx" ON "IngredientPurchase"("organizationId");

-- CreateIndex
CREATE INDEX "IngredientPurchase_ingredientId_idx" ON "IngredientPurchase"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientPurchase_purchaseDate_idx" ON "IngredientPurchase"("purchaseDate");

-- CreateIndex
CREATE INDEX "StockMovement_organizationId_idx" ON "StockMovement"("organizationId");

-- CreateIndex
CREATE INDEX "StockMovement_ingredientId_idx" ON "StockMovement"("ingredientId");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- CreateIndex
CREATE INDEX "StockMovement_movementDate_idx" ON "StockMovement"("movementDate");
