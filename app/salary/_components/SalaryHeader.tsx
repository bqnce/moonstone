import React from "react";
import { Briefcase } from "lucide-react";

export default function SalaryHeader() {
  return (
    <div className="text-center mb-10 space-y-2">
      <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-2xl mb-4 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-900/20">
        <Briefcase className="w-8 h-8 text-emerald-500" />
      </div>
      <h1 className="text-4xl font-bold text-white tracking-tight">
        Salary Injection
      </h1>
      <p className="text-zinc-400 max-w-md mx-auto">
        Securely register your monthly income.
      </p>
    </div>
  );
}