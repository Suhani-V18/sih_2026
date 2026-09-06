 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Star } from "lucide-react";

export default function ShortlistActions({
  problemId,
  universityId,
}: {
  problemId: string;
  universityId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);

  async function handleDecision(status: "ACCEPTED" | "REJECTED" | "SUGGESTED") {
    setLoading(true);
    try {
      const res = await fetch("/api/matches/university", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, universityId, status }),
      });

      if (res.ok) {
        if (status === "SUGGESTED") {
          setIsShortlisted(true);
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {/* 1. Decline Button */}
      <button
        disabled={loading}
        onClick={() => handleDecision("REJECTED")}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" /> Decline
      </button>

      {/* 2. ⭐ Shortlist Bookmark Button */}
      <button
        disabled={loading}
        onClick={() => handleDecision("SUGGESTED")}
        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
          isShortlisted
            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
            : "bg-slate-900 text-slate-300 border-slate-800 hover:text-amber-300"
        }`}
      >
        <Star className={`w-4 h-4 ${isShortlisted ? "fill-amber-400 text-amber-400" : ""}`} />
        {isShortlisted ? "Shortlisted" : "Shortlist"}
      </button>

      {/* 3. Accept & Start Button */}
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