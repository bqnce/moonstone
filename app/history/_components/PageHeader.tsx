import React from "react";
import { History } from "lucide-react";

export default function PageHeader() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <History className="w-6 h-6 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          History Log
        </h1>
      </div>
      <p className="text-zinc-400 ml-1">
        Audit trail of all balance changes and transactions
      </p>
    </div>
  );
}