"use client";

import { useEffect, useState } from "react";
import {
  DEPOSIT_PAID_POLL_MS,
  isConfirmedBookingMessage,
  type DepositReturn,
  type DepositReturnPhase,
} from "@/lib/deposit";

const COPY: Record<
  DepositReturnPhase,
  { title: string; body: string }
> = {
  pending: {
    title: "Betaling wordt verwerkt",
    body: "Even geduld — we bevestigen je afspraak. Dit scherm blijft staan tot het voorschot is verwerkt.",
  },
  confirmed: {
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
  sessionId = null,
}: {
  status: DepositReturn | null;
  sessionId?: string | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState<DepositReturnPhase | null>(
    status === "cancel" ? "cancel" : status === "success" ? "pending" : null,
  );

  useEffect(() => {
    if (status !== "success" || phase === "confirmed") return;

    const confirm = () => {
      setPhase((current) => (current === "confirmed" ? current : "confirmed"));
    };

    const onMessage = (event: MessageEvent) => {
      if (isConfirmedBookingMessage(event.data)) {
        confirm();
      }
    };
    window.addEventListener("message", onMessage);

    // Paid Checkout return: short poll, then celebrate. Typed
    // ?deposit=success without session_id stays pending (not unpaid success).
    let timer: number | undefined;
    if (sessionId) {
      timer = window.setTimeout(confirm, DEPOSIT_PAID_POLL_MS);
    }

    return () => {
      window.removeEventListener("message", onMessage);
      if (timer) window.clearTimeout(timer);
    };
  }, [status, sessionId, phase]);

  useEffect(() => {
    if (phase !== "confirmed") return;
    const root = document.querySelector<HTMLElement>(".deposit-return-overlay");
    if (!root) return;
    fireConfetti(root);
  }, [phase]);

  if (!status || !phase || dismissed) {
    return null;
  }

  const copy = COPY[phase];

  if (phase === "cancel") {
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
      className={`deposit-return-overlay ${phase}`}
      role="status"
      aria-live="polite"
      aria-busy={phase === "pending"}
    >
      <div className="deposit-return-card">
        {phase === "confirmed" ? (
          <div className="deposit-return-check" aria-hidden>
            ✓
          </div>
        ) : (
          <div className="deposit-return-spinner" aria-hidden />
        )}
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        {phase === "confirmed" ? (
          <button
            type="button"
            className="deposit-return-again"
            onClick={() => setDismissed(true)}
          >
            Boek een nieuwe afspraak
          </button>
        ) : null}
      </div>
    </div>
  );
}
