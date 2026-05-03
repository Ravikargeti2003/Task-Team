// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AppLayout } from "@/components/AppLayout";
// import { useAuth } from "@/lib/auth";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Link } from "react-router-dom";
// import { format, parseISO, isPast } from "date-fns";
// import { toast } from "sonner";

// interface Task {
//   id: string; title: string; status: "todo" | "in_progress" | "done";
//   priority: string; due_date: string | null; project_id: string;
//   projects: { name: string } | null;
// }

// export default function MyTasks() {
//   const { user } = useAuth();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { if (user) load(); }, [user]);

//   const load = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("tasks")
//       .select("id,title,status,priority,due_date,project_id,projects(name)")
//       .eq("assignee_id", user!.id)
//       .order("due_date", { ascending: true, nullsFirst: false });
//     if (error) toast.error(error.message);
//     setTasks((data as any) || []);
//     setLoading(false);
//   };

//   const updateStatus = async (id: string, status: Task["status"]) => {
//     const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
//     if (error) { toast.error(error.message); return; }
//     setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
//   };

//   return (
//     <AppLayout>
//       <div className="mb-8">
//         <h1 className="text-3xl font-semibold tracking-tight">My tasks</h1>
//         <p className="text-muted-foreground mt-1">Tasks assigned to you across all projects.</p>
//       </div>

//       {loading ? (
//         <div className="text-sm text-muted-foreground">Loading…</div>
//       ) : tasks.length === 0 ? (
//         <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">No tasks assigned to you.</Card>
//       ) : (
//         <Card className="overflow-hidden">
//           <ul className="divide-y divide-border">
//             {tasks.map((t) => {
//               const overdue = t.due_date && t.status !== "done" && isPast(parseISO(t.due_date));
//               return (
//                 <li key={t.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/40">
//                   <div className="min-w-0 flex-1">
//                     <Link to={`/projects/${t.project_id}`} className="font-medium hover:underline">{t.title}</Link>
//                     <div className="text-xs text-muted-foreground mt-0.5">{t.projects?.name}</div>
//                   </div>
//                   <div className="flex items-center gap-3 shrink-0">
//                     <Badge variant="outline" className={`text-[10px] capitalize ${t.priority === "high" ? "border-destructive text-destructive" : ""}`}>{t.priority}</Badge>
//                     {t.due_date && (
//                       <span className={`text-xs font-mono ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
//                         {format(parseISO(t.due_date), "MMM d")}
//                       </span>
//                     )}
//                     <Select value={t.status} onValueChange={(v: any) => updateStatus(t.id, v)}>
//                       <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="todo">To do</SelectItem>
//                         <SelectItem value="in_progress">In progress</SelectItem>
//                         <SelectItem value="done">Done</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         </Card>
//       )}
//     </AppLayout>
//   );
// }



import { useEffect, useState } from "react";
import { api } from "@/integrations/api/client";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { format, parseISO, isPast } from "date-fns";
import { toast } from "sonner";

interface Task {
  id: string; title: string; status: "todo" | "in_progress" | "done";
  priority: string; due_date: string | null; project_id: string;
  project_name: string | null;
}

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/tasks/my');
      setTasks(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    try {
      await api.patch(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">My tasks</h1>
        <p className="text-muted-foreground mt-1">Tasks assigned to you across all projects.</p>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">No tasks assigned to you.</Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {tasks.map((t) => {
              const overdue = t.due_date && t.status !== "done" && isPast(parseISO(t.due_date));
              return (
                <li key={t.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <Link to={`/projects/${t.project_id}`} className="font-medium hover:underline">{t.title}</Link>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.project_name}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className={`text-[10px] capitalize ${t.priority === "high" ? "border-destructive text-destructive" : ""}`}>{t.priority}</Badge>
                    {t.due_date && (
                      <span className={`text-xs font-mono ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                        {format(parseISO(t.due_date), "MMM d")}
                      </span>
                    )}
                    <Select value={t.status} onValueChange={(v: any) => updateStatus(t.id, v)}>
                      <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </AppLayout>
  );
}