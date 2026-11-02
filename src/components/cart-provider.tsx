"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { lineKey } from "@/lib/format";
import type { CartLine, Product } from "@/lib/types";

const STORAGE_KEY = "boutique.cart.v1";

type DetailedLine = { line: CartLine; product: Product };

type CartValue = {
  lines: CartLine[];
  detailed: DetailedLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (slug: string, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({
  children,
  catalog,
}: {
  children: React.ReactNode;
  catalog: Product[];
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        // Hydration reads an external system after mount. Reading during render
        // would make the server and client markup disagree.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setLines(parsed as CartLine[]);
      }
    } catch {
      // A corrupt cart is not worth blocking the storefront for.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const bySlug = useMemo(
    () => new Map(catalog.map((product) => [product.slug, product])),
    [catalog],
  );

  const add = useCallback((slug: string, size: string, qty = 1) => {
    setLines((current) => {
      const key = lineKey(slug, size);
      const existing = current.find(
        (line) => lineKey(line.slug, line.size) === key,
      );
      if (existing) {
        return current.map((line) =>
          lineKey(line.slug, line.size) === key
            ? { ...line, qty: Math.min(line.qty + qty, 99) }
            : line,
        );
      }
      return [...current, { slug, size, qty }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((current) =>
      qty <= 0
        ? current.filter((line) => lineKey(line.slug, line.size) !== key)
        : current.map((line) =>
            lineKey(line.slug, line.size) === key
              ? { ...line, qty: Math.min(qty, 99) }
              : line,
          ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) =>
      current.filter((line) => lineKey(line.slug, line.size) !== key),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const detailed = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = bySlug.get(line.slug);
        return product ? [{ line, product }] : [];
      }),
    [lines, bySlug],
  );

  const value = useMemo<CartValue>(() => {
    return {
      lines,
      detailed,
      count: detailed.reduce((total, entry) => total + entry.line.qty, 0),
      subtotal: detailed.reduce(
        (total, entry) => total + entry.product.price * entry.line.qty,
        0,
      ),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, detailed, isOpen, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
