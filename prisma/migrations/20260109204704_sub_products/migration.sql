-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecipeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "subProductId" TEXT,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    CONSTRAINT "RecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeItem_subProductId_fkey" FOREIGN KEY ("subProductId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeItem" ("id", "ingredientId", "productId", "quantity", "unit") SELECT "id", "ingredientId", "productId", "quantity", "unit" FROM "RecipeItem";
DROP TABLE "RecipeItem";
ALTER TABLE "new_RecipeItem" RENAME TO "RecipeItem";
CREATE INDEX "RecipeItem_productId_idx" ON "RecipeItem"("productId");
CREATE INDEX "RecipeItem_ingredientId_idx" ON "RecipeItem"("ingredientId");
CREATE INDEX "RecipeItem_subProductId_idx" ON "RecipeItem"("subProductId");
CREATE UNIQUE INDEX "RecipeItem_productId_ingredientId_key" ON "RecipeItem"("productId", "ingredientId");
CREATE UNIQUE INDEX "RecipeItem_productId_subProductId_key" ON "RecipeItem"("productId", "subProductId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
