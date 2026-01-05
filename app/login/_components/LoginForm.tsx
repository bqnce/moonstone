import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  onSubmit,
  loading,
  error,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 mt-8">
      {/* Username Input */}
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-sm font-medium text-foreground"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={cn(
            "w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground",
            "outline-none focus:border-[#4D4C4C] hover:border-[#4D4C4C] transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          placeholder="Enter your username"
          disabled={loading}
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={cn(
            "w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground",
            "outline-none focus:border-[#4D4C4C] hover:border-[#4D4C4C] transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 animate-in fade-in slide-in-from-top-1">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground",
          "outline-none cursor-pointer focus:bg-[#4B7841] hover:bg-[#4B7841] transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200"
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}