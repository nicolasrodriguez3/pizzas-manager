"use client";

import { recordSale } from "@/app/actions";
import { PRODUCT_TYPE_ICONS, ProductType } from "@/app/config/constants";
import type { ProductWithCost } from "@/app/types";
import { useState, useTransition } from "react";

type POSInterfaceProps = {
  products: ProductWithCost[];
};

type CartItem = {
  product: ProductWithCost;
  quantity: number;
};

export function POSInterface({ products }: POSInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const addToCart = (product: ProductWithCost) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    startTransition(async () => {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await recordSale(items);
      setCart([]); // Clear cart on success (if server action doesn't throw)
    });
  };

  const total = cart.reduce(
    (acc, item) => acc + item.quantity * item.product.basePrice,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Product Grid */}
      <div className="md:col-span-2 overflow-y-auto pr-2">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Menú</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white/80 border border-gray-800/10 hover:bg-white hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all h-32 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-2">
                {PRODUCT_TYPE_ICONS[product.type as ProductType] || "📦"}
              </div>
              <div className="font-bold text-gray-700 text-center text-sm">
                {product.name}
              </div>
              <div className="text-green-400 font-mono text-sm">
                ${product.basePrice.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Side Panel */}
      <div className="md:col-span-1 bg-gray-100/5 backdrop-blur-xl border border-gray-500/10 rounded-2xl flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-500/10 bg-white/50">
          <h2 className="text-xl font-bold text-gray-700">Pedido Actual</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-gray-400 text-center py-10 italic">
              Carrito vacío
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-white/50"
              >
                <div>
                  <div className="font-medium text-gray-700">
                    {item.product.name}
                  </div>
                  <div className="text-xs text-green-400">
                    ${item.product.basePrice.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white/50 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="px-2 py-1 text-gray-400 hover:text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-gray-700 text-sm w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="px-2 py-1 text-gray-400 hover:text-gray-700"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/30 rounded-b-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">Total</span>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-600">
              ${total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isPending}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
              cart.length === 0 || isPending
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/20 active:scale-95"
            }`}
          >
            {isPending ? "Procesando..." : "Checkout & Pagar"}
          </button>
        </div>
      </div>
    </div>
  );
}
