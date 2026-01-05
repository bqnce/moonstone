import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-xl text-muted-foreground">Loading Wallets...</p>
    </div>
  );
}