"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Moonstone</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

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

        <div className="text-center text-xs text-muted-foreground">
          <p>Default credentials: admin / admin</p>
        </div>
      </div>
    </div>
  );
}

