// import { useEffect, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { AppLayout } from "@/components/AppLayout";
// import { useAuth } from "@/lib/auth";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ArrowLeft, Plus, Trash2, UserPlus, X } from "lucide-react";
// import { toast } from "sonner";
// import { z } from "zod";
// import { format, parseISO, isPast } from "date-fns";

// interface Project { id: string; name: string; description: string | null; owner_id: string; }
// interface Profile { id: string; full_name: string | null; email: string | null; }
// interface Task {
//   id: string; title: string; description: string | null; status: "todo" | "in_progress" | "done";
//   priority: "low" | "medium" | "high"; assignee_id: string | null; due_date: string | null; created_by: string;
// }
// interface Member { id: string; user_id: string; profiles?: Profile | null; }

// const taskSchema = z.object({
//   title: z.string().trim().min(1, "Title required").max(200),
//   description: z.string().trim().max(2000).optional(),
// });

// export default function ProjectDetail() {
//   const { id } = useParams<{ id: string }>();
//   const { user, role } = useAuth();
//   const navigate = useNavigate();
//   const [project, setProject] = useState<Project | null>(null);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [members, setMembers] = useState<Member[]>([]);
//   const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [taskOpen, setTaskOpen] = useState(false);
//   const [memberOpen, setMemberOpen] = useState(false);

//   // task form
//   const [title, setTitle] = useState("");
//   const [desc, setDesc] = useState("");
//   const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
//   const [assignee, setAssignee] = useState<string>("none");
//   const [dueDate, setDueDate] = useState("");

//   // member form
//   const [memberEmail, setMemberEmail] = useState("");

//   const isOwner = project?.owner_id === user?.id;
//   const isAdmin = role === "admin";
//   const canManage = isOwner || isAdmin;

//   useEffect(() => { if (id) load(); }, [id]);

//   const load = async () => {
//     setLoading(true);
//     const [{ data: p }, { data: t }, { data: m }, { data: profs }] = await Promise.all([
//       supabase.from("projects").select("*").eq("id", id!).maybeSingle(),
//       supabase.from("tasks").select("*").eq("project_id", id!).order("created_at", { ascending: false }),
//       supabase.from("project_members").select("id,user_id").eq("project_id", id!),
//       supabase.from("profiles").select("id,full_name,email"),
//     ]);
//     setProject(p as Project);
//     setTasks((t as Task[]) || []);
//     setMembers((m as any) || []);
//     setAllProfiles((profs as Profile[]) || []);
//     setLoading(false);
//   };

//   const memberPool = (): Profile[] => {
//     if (!project) return [];
//     const memberIds = new Set([project.owner_id, ...members.map((m) => m.user_id)]);
//     return allProfiles.filter((p) => memberIds.has(p.id));
//   };

//   const profileFor = (uid: string | null) => allProfiles.find((p) => p.id === uid);

//   const createTask = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const parsed = taskSchema.safeParse({ title, description: desc });
//     if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
//     const { error } = await supabase.from("tasks").insert({
//       project_id: id!, title: parsed.data.title, description: parsed.data.description || null,
//       priority, assignee_id: assignee === "none" ? null : assignee,
//       due_date: dueDate || null, created_by: user!.id,
//     });
//     if (error) { toast.error(error.message); return; }
//     toast.success("Task created");
//     setTitle(""); setDesc(""); setPriority("medium"); setAssignee("none"); setDueDate(""); setTaskOpen(false);
//     load();
//   };

//   const updateStatus = async (taskId: string, status: Task["status"]) => {
//     const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
//     if (error) { toast.error(error.message); return; }
//     setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
//   };

//   const deleteTask = async (taskId: string) => {
//     if (!confirm("Delete this task?")) return;
//     const { error } = await supabase.from("tasks").delete().eq("id", taskId);
//     if (error) { toast.error(error.message); return; }
//     toast.success("Task deleted");
//     load();
//   };

//   const addMember = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const email = memberEmail.trim().toLowerCase();
//     if (!email) return;
//     const profile = allProfiles.find((p) => p.email?.toLowerCase() === email);
//     if (!profile) { toast.error("No user found with that email. They must sign up first."); return; }
//     if (profile.id === project?.owner_id) { toast.error("Owner is already a member"); return; }
//     const { error } = await supabase.from("project_members").insert({ project_id: id!, user_id: profile.id });
//     if (error) { toast.error(error.message); return; }
//     toast.success("Member added");
//     setMemberEmail(""); setMemberOpen(false); load();
//   };

//   const removeMember = async (memberId: string) => {
//     const { error } = await supabase.from("project_members").delete().eq("id", memberId);
//     if (error) { toast.error(error.message); return; }
//     load();
//   };

//   const deleteProject = async () => {
//     if (!confirm("Delete this project and all its tasks?")) return;
//     const { error } = await supabase.from("projects").delete().eq("id", id!);
//     if (error) { toast.error(error.message); return; }
//     toast.success("Project deleted");
//     navigate("/projects");
//   };

//   const canUpdateTask = (t: Task) => canManage || t.assignee_id === user?.id;

//   const grouped = {
//     todo: tasks.filter((t) => t.status === "todo"),
//     in_progress: tasks.filter((t) => t.status === "in_progress"),
//     done: tasks.filter((t) => t.status === "done"),
//   };

//   if (loading) return <AppLayout><div className="text-sm text-muted-foreground">Loading…</div></AppLayout>;
//   if (!project) return <AppLayout><div className="text-sm text-muted-foreground">Project not found.</div></AppLayout>;

//   return (
//     <AppLayout>
//       <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Projects</Link>

//       <div className="flex items-start justify-between mb-2 gap-4">
//         <div>
//           <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
//           {project.description && <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>}
//         </div>
//         <div className="flex gap-2 shrink-0">
//           {canManage && (
//             <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
//               <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New task</Button></DialogTrigger>
//               <DialogContent>
//                 <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
//                 <form onSubmit={createTask} className="space-y-4">
//                   <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
//                   <div className="space-y-2"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-2">
//                       <Label>Priority</Label>
//                       <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
//                         <SelectTrigger><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="low">Low</SelectItem>
//                           <SelectItem value="medium">Medium</SelectItem>
//                           <SelectItem value="high">High</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Due date</Label>
//                       <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Assignee</Label>
//                     <Select value={assignee} onValueChange={setAssignee}>
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="none">Unassigned</SelectItem>
//                         {memberPool().map((p) => (
//                           <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <Button type="submit" className="w-full">Create task</Button>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center gap-2 mb-8 mt-3 text-xs">
//         {isOwner && <Badge variant="secondary">Owner</Badge>}
//         {isAdmin && <Badge variant="secondary">Admin</Badge>}
//         <span className="text-muted-foreground font-mono">{tasks.length} tasks · {members.length + 1} members</span>
//       </div>

//       <div className="grid lg:grid-cols-[1fr_280px] gap-6">
//         <div className="grid md:grid-cols-3 gap-4">
//           {(["todo", "in_progress", "done"] as const).map((col) => (
//             <div key={col}>
//               <div className="flex items-center justify-between mb-3 px-1">
//                 <h3 className="text-sm font-semibold capitalize">{col.replace("_", " ")}</h3>
//                 <span className="text-xs font-mono text-muted-foreground">{grouped[col].length}</span>
//               </div>
//               <div className="space-y-2 min-h-[100px]">
//                 {grouped[col].map((t) => {
//                   const overdue = t.due_date && t.status !== "done" && isPast(parseISO(t.due_date));
//                   const ap = profileFor(t.assignee_id);
//                   return (
//                     <Card key={t.id} className="p-3 group">
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="text-sm font-medium leading-snug">{t.title}</div>
//                         {canManage && (
//                           <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </button>
//                         )}
//                       </div>
//                       {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
//                       <div className="flex items-center gap-1.5 mt-3 flex-wrap">
//                         <Badge variant="outline" className={`text-[10px] capitalize ${t.priority === "high" ? "border-destructive text-destructive" : ""}`}>{t.priority}</Badge>
//                         {t.due_date && (
//                           <span className={`text-[10px] font-mono ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
//                             {format(parseISO(t.due_date), "MMM d")}
//                           </span>
//                         )}
//                         {ap && <span className="text-[10px] text-muted-foreground ml-auto">{ap.full_name || ap.email?.split("@")[0]}</span>}
//                       </div>
//                       {canUpdateTask(t) && (
//                         <Select value={t.status} onValueChange={(v: any) => updateStatus(t.id, v)}>
//                           <SelectTrigger className="h-7 text-xs mt-2"><SelectValue /></SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="todo">To do</SelectItem>
//                             <SelectItem value="in_progress">In progress</SelectItem>
//                             <SelectItem value="done">Done</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       )}
//                     </Card>
//                   );
//                 })}
//                 {grouped[col].length === 0 && <div className="text-xs text-muted-foreground px-1 py-4">Empty</div>}
//               </div>
//             </div>
//           ))}
//         </div>

//         <Card className="p-4 h-fit">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-semibold">Team</h3>
//             {canManage && (
//               <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
//                 <DialogTrigger asChild><Button size="sm" variant="ghost"><UserPlus className="h-4 w-4" /></Button></DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader><DialogTitle>Add member</DialogTitle></DialogHeader>
//                   <form onSubmit={addMember} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Email</Label>
//                       <Input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="teammate@company.com" required />
//                       <p className="text-xs text-muted-foreground">User must already have an account.</p>
//                     </div>
//                     <Button type="submit" className="w-full">Add</Button>
//                   </form>
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>
//           <ul className="space-y-2">
//             <li className="flex items-center justify-between text-sm">
//               <div className="flex items-center gap-2 min-w-0">
//                 <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-mono">
//                   {(profileFor(project.owner_id)?.full_name || profileFor(project.owner_id)?.email || "?").charAt(0).toUpperCase()}
//                 </div>
//                 <span className="truncate">{profileFor(project.owner_id)?.full_name || profileFor(project.owner_id)?.email}</span>
//               </div>
//               <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Owner</span>
//             </li>
//             {members.map((m) => {
//               const p = profileFor(m.user_id);
//               return (
//                 <li key={m.id} className="flex items-center justify-between text-sm group">
//                   <div className="flex items-center gap-2 min-w-0">
//                     <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-mono">
//                       {(p?.full_name || p?.email || "?").charAt(0).toUpperCase()}
//                     </div>
//                     <span className="truncate">{p?.full_name || p?.email}</span>
//                   </div>
//                   {canManage && (
//                     <button onClick={() => removeMember(m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
//                       <X className="h-3.5 w-3.5" />
//                     </button>
//                   )}
//                 </li>
//               );
//             })}
//           </ul>
//           {canManage && (
//             <Button variant="outline" size="sm" className="w-full mt-4 text-destructive hover:text-destructive" onClick={deleteProject}>
//               <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete project
//             </Button>
//           )}
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }



import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { format, parseISO, isPast } from "date-fns";

interface Project { id: string; name: string; description: string | null; owner_id: string; }
interface Profile { id: string; full_name: string | null; email: string | null; }
interface Task {
  id: string; title: string; description: string | null; status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high"; assignee_id: string | null; due_date: string | null; created_by: string;
}
interface Member { id: string; user_id: string; full_name: string | null; email: string | null; }

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200),
  description: z.string().trim().max(2000).optional(),
});

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskOpen, setTaskOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignee, setAssignee] = useState<string>("none");
  const [dueDate, setDueDate] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const isOwner = project?.owner_id === user?.id;
  const isAdmin = role === "admin";
  const canManage = isOwner || isAdmin;

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const [p, t, m, profs] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/members/project/${id}`),
        api.get('/users'),
      ]);
      setProject(p);
      setTasks(t || []);
      setMembers(m || []);
      setAllProfiles(profs || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const memberPool = (): Profile[] => {
    if (!project) return [];
    const memberIds = new Set([project.owner_id, ...members.map((m) => m.user_id)]);
    return allProfiles.filter((p) => memberIds.has(p.id));
  };

  const profileFor = (uid: string | null) => allProfiles.find((p) => p.id === uid);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = taskSchema.safeParse({ title, description: desc });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    try {
      await api.post('/tasks', {
        project_id: id, title: parsed.data.title, description: parsed.data.description || null,
        priority, assignee_id: assignee === "none" ? null : assignee,
        due_date: dueDate || null,
      });
      toast.success("Task created");
      setTitle(""); setDesc(""); setPriority("medium"); setAssignee("none"); setDueDate(""); setTaskOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateStatus = async (taskId: string, status: Task["status"]) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/members', { project_id: id, email: memberEmail });
      toast.success("Member added");
      setMemberEmail(""); setMemberOpen(false); load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await api.delete(`/members/${memberId}`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteProject = async () => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const canUpdateTask = (t: Task) => canManage || t.assignee_id === user?.id;

  const grouped = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  if (loading) return <AppLayout><div className="text-sm text-muted-foreground">Loading…</div></AppLayout>;
  if (!project) return <AppLayout><div className="text-sm text-muted-foreground">Project not found.</div></AppLayout>;

  return (
    <AppLayout>
      <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Projects</Link>

      <div className="flex items-start justify-between mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          {project.description && <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          {canManage && (
            <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
                <form onSubmit={createTask} className="space-y-4">
                  <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due date</Label>
                      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {memberPool().map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create task</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 mt-3 text-xs">
        {isOwner && <Badge variant="secondary">Owner</Badge>}
        {isAdmin && <Badge variant="secondary">Admin</Badge>}
        <span className="text-muted-foreground font-mono">{tasks.length} tasks · {members.length + 1} members</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="grid md:grid-cols-3 gap-4">
          {(["todo", "in_progress", "done"] as const).map((col) => (
            <div key={col}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold capitalize">{col.replace("_", " ")}</h3>
                <span className="text-xs font-mono text-muted-foreground">{grouped[col].length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {grouped[col].map((t) => {
                  const overdue = t.due_date && t.status !== "done" && isPast(parseISO(t.due_date));
                  const ap = profileFor(t.assignee_id);
                  return (
                    <Card key={t.id} className="p-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-snug">{t.title}</div>
                        {canManage && (
                          <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] capitalize ${t.priority === "high" ? "border-destructive text-destructive" : ""}`}>{t.priority}</Badge>
                        {t.due_date && (
                          <span className={`text-[10px] font-mono ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {format(parseISO(t.due_date), "MMM d")}
                          </span>
                        )}
                        {ap && <span className="text-[10px] text-muted-foreground ml-auto">{ap.full_name || ap.email?.split("@")[0]}</span>}
                      </div>
                      {canUpdateTask(t) && (
                        <Select value={t.status} onValueChange={(v: any) => updateStatus(t.id, v)}>
                          <SelectTrigger className="h-7 text-xs mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To do</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Card>
                  );
                })}
                {grouped[col].length === 0 && <div className="text-xs text-muted-foreground px-1 py-4">Empty</div>}
              </div>
            </div>
          ))}
        </div>

        <Card className="p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Team</h3>
            {canManage && (
              <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
                <DialogTrigger asChild><Button size="sm" variant="ghost"><UserPlus className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add member</DialogTitle></DialogHeader>
                  <form onSubmit={addMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="teammate@company.com" required />
                      <p className="text-xs text-muted-foreground">User must already have an account.</p>
                    </div>
                    <Button type="submit" className="w-full">Add</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-mono">
                  {(profileFor(project.owner_id)?.full_name || profileFor(project.owner_id)?.email || "?").charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{profileFor(project.owner_id)?.full_name || profileFor(project.owner_id)?.email}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Owner</span>
            </li>
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm group">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-mono">
                    {(m.full_name || m.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{m.full_name || m.email}</span>
                </div>
                {canManage && (
                  <button onClick={() => removeMember(m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {canManage && (
            <Button variant="outline" size="sm" className="w-full mt-4 text-destructive hover:text-destructive" onClick={deleteProject}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete project
            </Button>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
