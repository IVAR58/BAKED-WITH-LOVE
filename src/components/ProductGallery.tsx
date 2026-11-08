"use client";

import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [""];

  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-cream shadow-card">
        <div className="aspect-[4/5]">
          {list[active] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={active}
              src={list[active]}
              alt={`${name} — photo ${active + 1}`}
              className="h-full w-full object-cover animate-fade-in"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-soft">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
          )}
        </div>
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-3">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-16 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-mauve" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
