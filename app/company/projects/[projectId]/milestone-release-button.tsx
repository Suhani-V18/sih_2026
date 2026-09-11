"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, IndianRupee } from "lucide-react";

export default function MilestoneReleaseButton({
  milestoneId,
  status,
}: {
  milestoneId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRelease() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/milestones/release", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to release milestone");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status === "RELEASED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
        <CheckCircle2 className="w-4 h-4" /> Funds Released
      </span>
    );
  }

  if (status !== "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
        Awaiting Verification
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRelease}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Releasing...
          </>
        ) : (
          <>
            <IndianRupee className="w-4 h-4" /> Release Funds
          </>
        )}
      </button>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}