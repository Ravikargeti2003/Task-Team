import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ArrowRight, CheckCircle2, Users, Zap } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">TT</div>
            <span className="font-semibold tracking-tight">TaskTeam</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild><Link to="/dashboard">Open app <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
                <Button asChild><Link to="/auth">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="flex-1 grid-bg relative">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" /> Built for small teams
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Team task management,<br />without the noise.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Create projects, assign work, track progress. Role-based access for admins and members. That's it.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild><Link to="/auth">Start for free <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
          {[
            { icon: Zap, title: "Fast by default", desc: "Keyboard-friendly. No bloat. Open a project, add a task, move on." },
            { icon: Users, title: "Roles that matter", desc: "Admins manage. Members execute. Assignees update. Simple." },
            { icon: CheckCircle2, title: "Always in sync", desc: "Real-time-ready data with secure row-level access control." },
          ].map((f) => (
            <div key={f.title} className="bg-background p-8">
              <f.icon className="h-5 w-5 mb-4" />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} TaskTeam</span>
          <span className="font-mono">v1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
