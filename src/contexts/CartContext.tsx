"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import {
  CART_STORAGE_KEY,
  cartCount,
  cartReducer,
  cartSubtotal,
  lineKey,
  parseStoredCart,
  type CartLine,
  type NewLine,
} from "@/lib/cart";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** False until the saved cart has been read from localStorage. */
  ready: boolean;
  isOpen: boolean;
  /** The line most recently added and when, so the drawer can highlight it. */
  lastAdded: { key: string; at: number } | null;
  add: (line: NewLine, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ key: string; at: number } | null>(null);

  // Load after mount so server and first client render match.
  useEffect(() => {
    dispatch({ type: "replace", lines: readStorage() });
    setReady(true);

    // Keep tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CART_STORAGE_KEY) return;
      dispatch({ type: "replace", lines: parseStoredCart(e.newValue) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist every change once the saved cart has been loaded (writing the
  // value another tab just sent is a no-op, so tabs do not ping-pong).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private mode or storage full: the cart still works for this visit.
    }
  }, [lines, ready]);

  const add = useCallback((line: NewLine, qty = 1) => {
    dispatch({ type: "add", line, qty });
    setLastAdded({ key: lineKey(line), at: Date.now() });
    setOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "setQty", key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      ready,
      isOpen,
      lastAdded,
      add,
      setQty,
      remove,
      clear,
      open,
      close,
    }),
    [lines, ready, isOpen, lastAdded, add, setQty, remove, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
