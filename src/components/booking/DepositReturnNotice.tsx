"use client";

import { useState } from "react";
import type { DepositReturn } from "@/lib/deposit";

const COPY: Record<DepositReturn, { title: string; body: string }> = {
  success: {
    title: "Betaling ontvangen",
    body: "Je afspraak wordt bevestigd zodra de betaling is verwerkt.",
  },
  cancel: {
    title: "Betaling geannuleerd",
    body: "Je kunt de boeking opnieuw afronden in het formulier hieronder.",
  },
};

export function DepositReturnNotice({ status }: { status: DepositReturn | null }) {
  const [dismissed, setDismissed] = useState(false);

  if (!status || dismissed) {
    return null;
  }

  const copy = COPY[status];
  const tone =
    status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <div
      className={`deposit-return-notice ${tone}`}
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
