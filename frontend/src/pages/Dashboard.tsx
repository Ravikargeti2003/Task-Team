// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AppLayout } from "@/components/AppLayout";
// import { useAuth } from "@/lib/auth";
// import { Link } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { CheckCircle2, Clock, AlertCircle, FolderKanban } from "lucide-react";
// import { format, isPast, parseISO } from "date-fns";

// interface Stats { total: number; todo: number; inProgress: number; done: number; overdue: number; projects: number; }
// interface TaskRow { id: string; title: string; status: string; due_date: string | null; project_id: string; projects?: { name: string } | null; }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0, projects: 0 });
//   const [recent, setRecent] = useState<TaskRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { if (user) load(); }, [user]);

//   const load = async () => {
//     setLoading(true);
//     const [{ data: tasks }, { data: projects }] = await Promise.all([
//       supabase.from("tasks").select("id,title,status,due_date,project_id,projects(name)").order("updated_at", { ascending: false }),
//       supabase.from("projects").select("id"),
//     ]);
//     const t = tasks || [];
//     const today = new Date(); today.setHours(0,0,0,0);
//     setStats({
//       total: t.length,
//       todo: t.filter(x => x.status === "todo").length,
//       inProgress: t.filter(x => x.status === "in_progress").length,
//       done: t.filter(x => x.status === "done").length,
//       overdue: t.filter(x => x.due_date && x.status !== "done" && isPast(parseISO(x.due_date)) && parseISO(x.due_date) < today).length,
//       projects: projects?.length || 0,
//     });
//     setRecent(t.slice(0, 8) as TaskRow[]);
//     setLoading(false);
//   };

//   const cards = [
//     { label: "Total tasks", value: stats.total, icon: CheckCircle2 },
//     { label: "In progress", value: stats.inProgress, icon: Clock },
//     { label: "Overdue", value: stats.overdue, icon: AlertCircle, accent: stats.overdue > 0 },
//     { label: "Projects", value: stats.projects, icon: FolderKanban },
//   ];

//   return (
//     <AppLayout>
//       <div className="mb-8">
//         <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
//         <p className="text-muted-foreground mt-1">An overview of your work.</p>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
//         {cards.map((c) => (
//           <Card key={c.label} className="p-5">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">{c.label}</span>
//               <c.icon className={`h-4 w-4 ${c.accent ? "text-destructive" : "text-muted-foreground"}`} />
//             </div>
//             <div className={`mt-3 text-3xl font-semibold tracking-tight ${c.accent ? "text-destructive" : ""}`}>{c.value}</div>
//           </Card>
//         ))}
//       </div>

//       <div className="grid md:grid-cols-3 gap-4 mb-8">
//         <StatusBar label="To do" value={stats.todo} total={stats.total} />
//         <StatusBar label="In progress" value={stats.inProgress} total={stats.total} />
//         <StatusBar label="Done" value={stats.done} total={stats.total} />
//       </div>

//       <Card className="overflow-hidden">
//         <div className="px-5 py-4 border-b border-border flex items-center justify-between">
//           <h2 className="font-semibold">Recent tasks</h2>
//           <Link to="/tasks" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
//         </div>
//         {loading ? (
//           <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
//         ) : recent.length === 0 ? (
//           <div className="p-12 text-center text-sm text-muted-foreground">No tasks yet. Create a project to get started.</div>
//         ) : (
//           <ul className="divide-y divide-border">
//             {recent.map((t) => (
//               <li key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/40">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <StatusDot status={t.status} />
//                   <div className="min-w-0">
//                     <Link to={`/projects/${t.project_id}`} className="font-medium truncate block hover:underline">{t.title}</Link>
//                     <div className="text-xs text-muted-foreground">{t.projects?.name}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 shrink-0">
//                   {t.due_date && (
//                     <span className={`text-xs font-mono ${isPast(parseISO(t.due_date)) && t.status !== "done" ? "text-destructive" : "text-muted-foreground"}`}>
//                       {format(parseISO(t.due_date), "MMM d")}
//                     </span>
//                   )}
//                   <Badge variant="outline" className="capitalize">{t.status.replace("_", " ")}</Badge>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </AppLayout>
//   );
// }

// const StatusBar = ({ label, value, total }: { label: string; value: number; total: number }) => {
//   const pct = total ? (value / total) * 100 : 0;
//   return (
//     <Card className="p-5">
//       <div className="flex items-center justify-between mb-3">
//         <span className="text-sm font-medium">{label}</span>
//         <span className="text-sm font-mono text-muted-foreground">{value}/{total}</span>
//       </div>
//       <div className="h-2 rounded-full bg-muted overflow-hidden">
//         <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
//       </div>
//     </Card>
//   );
// };

// const StatusDot = ({ status }: { status: string }) => {
//   const color = status === "done" ? "bg-success" : status === "in_progress" ? "bg-warning" : "bg-muted-foreground";
//   return <span className={`h-2 w-2 rounded-full ${color}`} style={status === "done" ? { backgroundColor: "hsl(var(--success))" } : status === "in_progress" ? { backgroundColor: "hsl(var(--warning))" } : {}} />;
// };




import { useEffect, useState } from "react";
import { api } from "@/integrations/api/client";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, FolderKanban } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

interface Stats { total: number; todo: number; inProgress: number; done: number; overdue: number; projects: number; }
interface TaskRow { id: string; title: string; status: string; due_date: string | null; project_id: string; project_name?: string; }

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0, projects: 0 });
  const [recent, setRecent] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const [tasks, projects] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      const t: TaskRow[] = tasks || [];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setStats({
        total: t.length,
        todo: t.filter(x => x.status === "todo").length,
        inProgress: t.filter(x => x.status === "in_progress").length,
        done: t.filter(x => x.status === "done").length,
        overdue: t.filter(x => x.due_date && x.status !== "done" && isPast(parseISO(x.due_date)) && parseISO(x.due_date) < today).length,
        projects: projects?.length || 0,
      });
      setRecent(t.slice(0, 8));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Total tasks", value: stats.total, icon: CheckCircle2 },
    { label: "In progress", value: stats.inProgress, icon: Clock },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, accent: stats.overdue > 0 },
    { label: "Projects", value: stats.projects, icon: FolderKanban },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">An overview of your work.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.accent ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div className={`mt-3 text-3xl font-semibold tracking-tight ${c.accent ? "text-destructive" : ""}`}>{c.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatusBar label="To do" value={stats.todo} total={stats.total} />
        <StatusBar label="In progress" value={stats.inProgress} total={stats.total} />
        <StatusBar label="Done" value={stats.done} total={stats.total} />
      </div>
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Recent tasks</h2>
          <Link to="/tasks" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No tasks yet. Create a project to get started.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((t) => (
              <li key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/40">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={t.status} />
                  <div className="min-w-0">
                    <Link to={`/projects/${t.project_id}`} className="font-medium truncate block hover:underline">{t.title}</Link>
                    <div className="text-xs text-muted-foreground">{t.project_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {t.due_date && (
                    <span className={`text-xs font-mono ${isPast(parseISO(t.due_date)) && t.status !== "done" ? "text-destructive" : "text-muted-foreground"}`}>
                      {format(parseISO(t.due_date), "MMM d")}
                    </span>
                  )}
                  <Badge variant="outline" className="capitalize">{t.status.replace("_", " ")}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppLayout>
  );
}

const StatusBar = ({ label, value, total }: { label: string; value: number; total: number }) => {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-mono text-muted-foreground">{value}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
      </div>
    </Card>
  );
};

const StatusDot = ({ status }: { status: string }) => (
  <span className="h-2 w-2 rounded-full" style={{
    backgroundColor: status === "done" ? "hsl(var(--success))" : status === "in_progress" ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))"
  }} />
);