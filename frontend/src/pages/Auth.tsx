
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { api, setToken, setStoredUser } from "@/integrations/api/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
  fullName: z.string().trim().min(1).max(100).optional(),
});

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName: mode === "signup" ? fullName : undefined });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const body = mode === "signup"
        ? { email, password, full_name: fullName }
        : { email, password };

      // const data = await api.post(endpoint, body);
      // setToken(data.token);
      // setStoredUser(data.user);
      // toast.success(mode === "signup" ? "Account created!" : "Welcome back!");
      // navigate("/dashboard");
      const data = await api.post(endpoint, body);
      setToken(data.token);
      setStoredUser(data.user);
      toast.success(mode === "signup" ? "Account created!" : "Welcome back!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-border grid-bg relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2 z-10">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-sm font-bold">TT</div>
          <span className="font-semibold">TaskTeam</span>
        </Link>
        <div className="z-10 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">Ship work, not status updates.</h1>
          <p className="mt-4 text-muted-foreground">A focused task manager for small teams. Projects, members, tasks, and clear ownership — nothing else.</p>
        </div>
        <div className="z-10 text-xs text-muted-foreground font-mono">v2.0 · Express + MySQL Backend</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin" ? "Sign in to continue." : "Start managing your team in seconds."}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center">
            {mode === "signin" ? "No account?" : "Already have one?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground font-medium underline-offset-4 hover:underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}