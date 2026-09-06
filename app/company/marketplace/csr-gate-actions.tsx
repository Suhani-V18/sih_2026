"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function CSRGateActions({
  projectId,
  companyId,
  stage,
}: {
  projectId: string;
  companyId: string;
  stage: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "ACCEPT_GATE1" | "DECLINE" | "APPROVE_GATE2_FUND") {
    setLoading(true);
    try {
      const res = await fetch("/api/matches/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, companyId, action }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("CSR Gate action error:", err);
    } finally {
      setLoading(false);
    }
  }

  // GATE 1 REVIEW CONTROLS
  if (stage === "GATE1_PROPOSAL" || stage === "ACCEPTED") {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={loading}
          onClick={() => handleAction("DECLINE")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer"
        >
          <XCircle className="w-4 h-4" /> Decline
        </button>

        <button
          disabled={loading}
          onClick={() => handleAction("ACCEPT_GATE1")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Accept Gate 1 & Request Gate 2 Pitch
        </button>
      </div>
    );
  }

  // GATE 2 DETAILED PITCH REVIEW CONTROLS
  if (stage === "GATE2_PITCH") {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={loading}
          onClick={() => handleAction("APPROVE_GATE2_FUND")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" /> Approve Gate 2 & Commit CSR Funds
        </button>
      </div>
    );
  }

  // FUNDED / IN PROGRESS
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
      <CheckCircle2 className="w-4 h-4" /> CSR Capital Committed
    </span>
  );
}