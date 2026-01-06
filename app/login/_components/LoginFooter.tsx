import React from "react";
import Link from "next/link";

export default function LoginFooter() {
  return (
    <div className="text-center mt-8 space-y-4">
      <p className="text-sm text-zinc-500">
        Don't have an account?{" "}
        <Link 
          href="/register" 
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}