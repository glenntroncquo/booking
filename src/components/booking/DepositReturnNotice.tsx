"use client";

import { useEffect, useRef, useState } from "react";
import type { DepositReturn } from "@/lib/deposit";

const COPY: Record<DepositReturn, { title: string; body: string }> = {
  success: {
    title: "Tot snel!",
    body: "Je afspraak is bevestigd. We sturen een bevestiging naar je e-mailadres.",
  },
  cancel: {
    title: "Betaling geannuleerd",
    body: "Er is geen afspraak vastgelegd. Je kunt de boeking hieronder opnieuw afronden.",
  },
};

function fireConfetti(root: HTMLElement) {
  const colors = ["#FF6B9D", "#FFB3D1", "#FFF0F5", "#E91E63", "#FF8FB2"];
  for (let i = 0; i < 36; i += 1) {
    const piece = document.createElement("span");
    piece.className = "deposit-confetti-piece";
    piece.style.left = `${8 + Math.random() * 84}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.animationDuration = `${1.4 + Math.random() * 0.8}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    root.appendChild(piece);
  }
}

export function DepositReturnNotice({
  status,
}: {
  status: DepositReturn | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "success") return;
    const root = overlayRef.current;
    if (!root) return;
    fireConfetti(root);
  }, [status]);

  if (!status || dismissed) {
    return null;
  }

  const copy = COPY[status];

  if (status === "cancel") {
    return (
      <div
        className="deposit-return-notice border-amber-200 bg-amber-50 text-amber-950"
        role="status"
        aria-live="polite"
      >
        <div>
          <p className="text-sm font-semibold">{copy.title}</p>
          <p className="mt-0.5 text-sm opacity-90">{copy.body}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium opacity-70 hover:opacity-100"
          onClick={() => setDismissed(true)}
        >
          Sluiten
        </button>
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      className="deposit-return-overlay success"
      role="status"
      aria-live="polite"
    >
      <div className="deposit-return-card">
        <div className="deposit-return-check" aria-hidden>
          ✓
        </div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <button
          type="button"
          className="deposit-return-again"
          onClick={() => setDismissed(true)}
        >
          Boek een nieuwe afspraak
        </button>
      </div>
    </div>
  );
}
