// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AppLayout } from "@/components/AppLayout";
// import { useAuth } from "@/lib/auth";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Plus, FolderKanban } from "lucide-react";
// import { Link } from "react-router-dom";
// import { toast } from "sonner";
// import { z } from "zod";
// import { format, parseISO } from "date-fns";

// const schema = z.object({
//   name: z.string().trim().min(1, "Name required").max(100),
//   description: z.string().trim().max(500).optional(),
// });

// interface Project { id: string; name: string; description: string | null; owner_id: string; created_at: string; }

// export default function Projects() {
//   const { user } = useAuth();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(false);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");

//   useEffect(() => { load(); }, []);

//   const load = async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
//     if (error) toast.error(error.message);
//     setProjects(data || []);
//     setLoading(false);
//   };

//   const create = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const parsed = schema.safeParse({ name, description });
//     if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
//     const { error } = await supabase.from("projects").insert({ name: parsed.data.name, description: parsed.data.description || null, owner_id: user!.id });
//     if (error) { toast.error(error.message); return; }
//     toast.success("Project created");
//     setName(""); setDescription(""); setOpen(false); load();
//   };

//   return (
//     <AppLayout>
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
//           <p className="text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 && "s"}</p>
//         </div>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New project</Button></DialogTrigger>
//           <DialogContent>
//             <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
//             <form onSubmit={create} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="pname">Name</Label>
//                 <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 Launch" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="pdesc">Description</Label>
//                 <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this project about?" rows={3} />
//               </div>
//               <Button type="submit" className="w-full">Create</Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {loading ? (
//         <div className="text-sm text-muted-foreground">Loading…</div>
//       ) : projects.length === 0 ? (
//         <Card className="p-16 text-center border-dashed">
//           <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
//           <h3 className="font-semibold mb-1">No projects yet</h3>
//           <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking work.</p>
//           <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New project</Button>
//         </Card>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {projects.map((p) => (
//             <Link key={p.id} to={`/projects/${p.id}`}>
//               <Card className="p-5 h-full hover:border-foreground transition-colors">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center font-mono text-xs">
//                     {p.name.slice(0, 2).toUpperCase()}
//                   </div>
//                   {p.owner_id === user?.id && <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Owner</span>}
//                 </div>
//                 <h3 className="font-semibold tracking-tight">{p.name}</h3>
//                 <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">{p.description || "No description"}</p>
//                 <div className="mt-4 text-xs font-mono text-muted-foreground">{format(parseISO(p.created_at), "MMM d, yyyy")}</div>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       )}
//     </AppLayout>
//   );
// }



import { useEffect, useState } from "react";
import { api } from "@/integrations/api/client";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { format, parseISO } from "date-fns";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  description: z.string().trim().max(500).optional(),
});

interface Project { id: string; name: string; description: string | null; owner_id: string; created_at: string; }

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/projects');
      setProjects(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, description });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    try {
      await api.post('/projects', { name: parsed.data.name, description: parsed.data.description || null });
      toast.success("Project created");
      setName(""); setDescription(""); setOpen(false); load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 && "s"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pname">Name</Label>
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 Launch" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdesc">Description</Label>
                <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this project about?" rows={3} />
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : projects.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking work.</p>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New project</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="p-5 h-full hover:border-foreground transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center font-mono text-xs">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  {p.owner_id === user?.id && <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Owner</span>}
                </div>
                <h3 className="font-semibold tracking-tight">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">{p.description || "No description"}</p>
                <div className="mt-4 text-xs font-mono text-muted-foreground">{format(parseISO(p.created_at), "MMM d, yyyy")}</div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}