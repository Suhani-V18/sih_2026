"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, CheckCircle2, Ban } from "lucide-react";
import { isLowConfidenceMatch } from "@/lib/classification";

export default function ShortlistActions({
  problemId,
  universityId,
  aiConfidence,
}: {
  problemId: string;
  universityId: string;
  aiConfidence?: number | string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const showNonInnovative = isLowConfidenceMatch(
    aiConfidence !== null && aiConfidence !== undefined ? Number(aiConfidence) : null
  );

  async function handleDecision(status: "ACCEPTED" | "REJECTED" | "NON_INNOVATIVE") {
    setLoading(true);
    try {
      const res = await fetch("/api/matches/university", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, universityId, status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <button
        disabled={loading}
        onClick={() => handleDecision("REJECTED")}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" /> Decline
      </button>

      {showNonInnovative && (
        <button
          disabled={loading}
          onClick={() => handleDecision("NON_INNOVATIVE")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-orange-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <Ban className="w-4 h-4" /> Mark Non-Innovative
        </button>
      )}

      <button
        disabled={loading}
        onClick={() => handleDecision("ACCEPTED")}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
      >
        <CheckCircle2 className="w-4 h-4" /> Accept & Start
      </button>
    </div>
  );
}