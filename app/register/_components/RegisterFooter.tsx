import React from "react";
import Link from "next/link";

export default function RegisterFooter() {
  return (
    <div className="mt-8 text-center">
      <p className="text-zinc-500 text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}