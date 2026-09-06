 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";

export default function StartProposalButton({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });

      const data = await res.json();
      if (res.ok && data.projectId) {
        router.push(`/university/projects/${data.projectId}`);
      }
    } catch (err) {
      console.error("Start proposal error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleStart}
      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
    >
      <Rocket className="w-4 h-4 text-amber-400" />
      {loading ? "Initializing Gate 1..." : "Start Gate 1 Proposal & Select Sponsor"}
    </button>
  );
}