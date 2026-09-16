import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { trackStoreEvent } from "./store-events";

export type CartLine = {
  slug: string;
  name: string;
  price: number | null;
  currency: string;
  quantity: number;
};

type CartValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number | null;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "dcl.bag";
const CartContext = createContext<CartValue | null>(null);

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        !!l && typeof (l as CartLine).slug === "string" && typeof (l as CartLine).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — the bag simply stays in memory */
    }
  }, []);

  const value = useMemo<CartValue>(() => {
    const priced = lines.filter((l) => typeof l.price === "number");
    const subtotal =
      priced.length === lines.length && lines.length > 0
        ? lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0)
        : null;

    return {
      lines,
      ready,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      add: (line, quantity = 1) => {
        const existing = lines.find((l) => l.slug === line.slug);
        const next = existing
          ? lines.map((l) => (l.slug === line.slug ? { ...l, quantity: l.quantity + quantity } : l))
          : [...lines, { ...line, quantity }];
        persist(next);
        trackStoreEvent("ADD_TO_CART", { slug: line.slug, quantity });
      },
      setQuantity: (slug, quantity) => {
        if (quantity <= 0) {
          persist(lines.filter((l) => l.slug !== slug));
          trackStoreEvent("REMOVE_FROM_CART", { slug });
          return;
        }
        persist(lines.map((l) => (l.slug === slug ? { ...l, quantity } : l)));
      },
      remove: (slug) => {
        persist(lines.filter((l) => l.slug !== slug));
        trackStoreEvent("REMOVE_FROM_CART", { slug });
      },
      clear: () => persist([]),
    };
  }, [lines, ready, persist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
