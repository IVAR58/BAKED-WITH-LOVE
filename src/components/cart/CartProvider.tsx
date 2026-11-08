"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { formatDZD } from "@/lib/utils";

export type CartItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (b: boolean) => void;
  add: (
    p: { id: number; name: string; slug: string; price: number; image?: string },
    quantity?: number,
  ) => void;
  remove: (id: number) => void;
  setQty: (id: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "bwl-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (i) =>
                i &&
                typeof i.id === "number" &&
                typeof i.name === "string" &&
                typeof i.price === "number" &&
                typeof i.quantity === "number",
            ),
          );
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const add = useCallback<CartContextValue["add"]>((p, quantity = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) {
        return prev.map((i) =>
          i.id === p.id ? { ...i, quantity: Math.min(20, i.quantity + quantity) } : i,
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.image ?? "",
          quantity,
        },
      ];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, quantity) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((a, i) => a + i.quantity, 0);
    const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
    return { items, count, subtotal, open, setOpen, add, remove, setQty, clear };
  }, [items, open, add, remove, setQty, clear]);

  const { count, subtotal } = value;

  return (
    <CartContext.Provider value={value}>
      {children}

      {/* Tiroir panier */}
      {open && (
        <div className="fixed inset-0 z-[70]">
          <button
            aria-label="Fermer le panier"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-paper shadow-soft flex flex-col animate-slide-in">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="text-[11px] tracking-luxe text-mauve uppercase">Votre panier</p>
                <h2 className="font-serif text-2xl">Nos douceurs</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-mauve hover:text-mauve"
                aria-label="Fermer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush-soft text-mauve">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6 8h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8Z" />
                      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                    </svg>
                  </span>
                  <p className="font-serif text-xl">Votre panier est vide</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Laissez-vous tenter par nos macarons.
                  </p>
                  <Link
                    href="/boutique"
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-ink px-7 py-3 text-sm tracking-wide2 text-paper transition hover:bg-mauve-deep"
                  >
                    Découvrir la boutique
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-4">
                      <Link
                        href={`/produit/${i.slug}`}
                        onClick={() => setOpen(false)}
                        className="block h-20 w-16 shrink-0 overflow-hidden rounded-md bg-cream"
                      >
                        {i.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                        ) : null}
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/produit/${i.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium leading-snug hover:text-mauve"
                          >
                            {i.name}
                          </Link>
                          <button
                            onClick={() => remove(i.id)}
                            className="text-ink-soft transition hover:text-mauve-deep"
                            aria-label={`Retirer ${i.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                              <path d="M2 2l12 12M14 2L2 14" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-soft">{formatDZD(i.price)}</p>
                        <div className="mt-auto flex items-center gap-3 pt-2">
                          <div className="flex items-center rounded-full border border-line">
                            <button
                              className="flex h-7 w-7 items-center justify-center text-ink-soft transition hover:text-mauve"
                              onClick={() => setQty(i.id, i.quantity - 1)}
                              aria-label="Diminuer"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm">{i.quantity}</span>
                            <button
                              className="flex h-7 w-7 items-center justify-center text-ink-soft transition hover:text-mauve"
                              onClick={() => setQty(i.id, i.quantity + 1)}
                              aria-label="Augmenter"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-medium">
                            {formatDZD(i.price * i.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm tracking-wide2 text-ink-soft uppercase">Sous-total</span>
                  <span className="font-serif text-2xl">{formatDZD(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/panier"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-ink px-5 py-3 text-center text-sm tracking-wide2 transition hover:bg-ink hover:text-paper"
                  >
                    Voir le panier
                  </Link>
                  <Link
                    href="/commande"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-mauve-deep px-5 py-3 text-center text-sm tracking-wide2 text-paper transition hover:bg-ink"
                  >
                    Passer commande
                  </Link>
                </div>
                <p className="mt-3 text-center text-xs text-ink-soft">
                  Livraison &amp; récupération au moment de la validation.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
