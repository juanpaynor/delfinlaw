"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Scale className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-xl font-bold text-foreground">Delfin Law Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your website</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/5 text-destructive text-sm p-3 rounded-lg border border-destructive/15">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@delfinlaw.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#fafafa] border-border/60 h-11 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#fafafa] border-border/60 h-11 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © {new Date().getFullYear()} Delfin Law Advocates
        </p>
      </div>
    </div>
  );
}
